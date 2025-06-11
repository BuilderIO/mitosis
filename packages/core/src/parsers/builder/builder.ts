import { hashCodeAsString } from '@/symbols/symbol-processor';
import { MitosisComponent, MitosisState } from '@/types/mitosis-component';
import * as babel from '@babel/core';
import generate from '@babel/generator';
import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { mapKeys, omit, sortBy, upperFirst } from 'lodash';
import traverse from 'neotraverse/legacy';
import { Size, sizeNames, sizes } from '../../constants/media-sizes';
import { createSingleBinding } from '../../helpers/bindings';
import { capitalize } from '../../helpers/capitalize';
import { createMitosisComponent } from '../../helpers/create-mitosis-component';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { fastClone } from '../../helpers/fast-clone';
import { isExpression, parseCode } from '../../helpers/parsers';
import { Dictionary } from '../../helpers/typescript';
import { Binding, BuilderLocalizedValue, MitosisNode } from '../../types/mitosis-node';
import { parseJsx } from '../jsx';
import { parseStateObjectToMitosisState } from '../jsx/state';
import { mapBuilderContentStateToMitosisState } from './helpers';

// Omit some superflous styles that can come from Builder's web importer
const styleOmitList: (keyof CSSStyleDeclaration | 'backgroundRepeatX' | 'backgroundRepeatY')[] = [
  'backgroundRepeatX',
  'backgroundRepeatY',
  'backgroundPositionX',
  'backgroundPositionY',
];

const getCssFromBlock = (block: BuilderElement) => {
  const blockSizes: Size[] = Object.keys(block.responsiveStyles || {}).filter((size) =>
    sizeNames.includes(size as Size),
  ) as Size[];
  let css: { [key: string]: Partial<CSSStyleDeclaration> | string } = {};
  for (const size of blockSizes) {
    if (size === 'large') {
      css = omit(
        {
          ...css,
          ...block.responsiveStyles?.large,
        },
        styleOmitList,
      ) as typeof css;
    } else if (block.responsiveStyles && block.responsiveStyles[size]) {
      const mediaQueryKey = `@media (max-width: ${sizes[size].max}px)`;
      css[mediaQueryKey] = omit(
        {
          ...(css[mediaQueryKey] as any),
          ...block.responsiveStyles[size],
        },
        styleOmitList,
      );
    }
  }

  return css;
};

const verifyIsValid = (code: string): { valid: boolean; error: null | Error } => {
  try {
    if (babel.parse(code)) {
      return { valid: true, error: null };
    }
  } catch (err) {
    return { valid: false, error: null };
  }
  return { valid: false, error: null };
};

const getActionBindingsFromBlock = (
  block: BuilderElement,
  options: BuilderToMitosisOptions,
): MitosisNode['bindings'] => {
  const actions = {
    ...block.actions,
    ...block.code?.actions,
  };
  const bindings: MitosisNode['bindings'] = {};
  const actionKeys = Object.keys(actions);
  if (actionKeys.length) {
    for (const key of actionKeys) {
      let value = actions[key];
      // Skip empty values
      if (!value.trim()) {
        continue;
      }
      const { error, valid } = verifyIsValid(value);
      if (!valid) {
        console.warn('Skipping invalid binding', error);
        continue;
      }
      const useKey = `on${upperFirst(key)}`;
      const asyncPrefix = `(async () =>`;
      const asyncSuffix = ')()';
      const isAsync = value.startsWith(asyncPrefix) && value.endsWith(asyncSuffix);
      if (isAsync) {
        value = value.slice(asyncPrefix.length, -asyncSuffix.length);
      }
      bindings[useKey] = createSingleBinding({
        code: `${wrapBindingIfNeeded(value, options)}`,
        async: isAsync ? true : undefined,
      });
    }
  }

  return bindings;
};

const getStyleStringFromBlock = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const styleBindings: any = {};
  const responsiveStyles: Record<string, Record<string, string>> = {};
  let styleString = '';

  if (block.bindings) {
    for (const key in block.bindings) {
      if (!key.includes('.')) {
        continue;
      }

      let code = block.code?.bindings?.[key] || block.bindings[key];
      const verifyCode = verifyIsValid(code);
      if (!verifyCode.valid) {
        if (options.escapeInvalidCode) {
          code = '`' + code + ' [INVALID CODE]`';
        } else {
          console.warn(`Dropping binding "${key}" due to invalid code: ${code}`);
          continue;
        }
      }

      if (key.includes('style')) {
        const styleProperty = key.split('.')[1];
        styleBindings[styleProperty] = convertExportDefaultToReturn(code);
        /**
         * responsiveStyles that are bound need to be merged into media queries.
         * Example:
         * responsiveStyles.large.color: "state.color"
         * responsiveStyles.large.background: "state.background"
         * Should get mapped to:
         * @media (max-width: 1200px): {
         *   color: state.color,
         *   background: state.background
         * }
         */
      } else if (key.includes('responsiveStyles')) {
        const [_, size, prop] = key.split('.');
        const mediaKey = `@media (max-width: ${sizes[size as Size].max}px)`;

        /**
         * The media query key has spaces/special characters so we need to ensure
         * that the key is always a string otherwise there will be runtime errors.
         */
        const objKey = `"${mediaKey}"`;
        responsiveStyles[objKey] = {
          ...responsiveStyles[objKey],
          [prop]: code,
        };
      }
    }

    /**
     * All binding values are strings, but we don't want to stringify the values
     * within the style object otherwise the bindings will be evaluated as strings.
     * As a result, do not use JSON.stringify here.
     */
    for (const key in responsiveStyles) {
      const styles = Object.keys(responsiveStyles[key]);
      const keyValues = styles.map((prop) => `${prop}: ${responsiveStyles[key][prop]}`);
      const stringifiedObject = `{ ${keyValues.join(', ')} }`;
      styleBindings[key] = stringifiedObject;
    }
  }

  const styleKeys = Object.keys(styleBindings);
  if (styleKeys.length) {
    styleString = '{';
    styleKeys.forEach((key) => {
      // TODO: figure out how to have multiline style bindings here
      // I tried (function{binding code})() and that did not work
      styleString += ` ${key}: ${(options.includeBuilderExtras
        ? wrapBinding(styleBindings[key])
        : styleBindings[key]
            .replace(/var _virtual_index\s*=\s*/g, '')
            .replace(/;*\s*return _virtual_index;*/, '')
      ).replace(/;$/, '')},`;
    });
    styleString += ' }';
  }

  return styleString;
};

const hasComponent = (block: BuilderElement) => {
  return Boolean(block.component?.name);
};

const hasProperties = (block: BuilderElement) => {
  return Boolean(block.properties && Object.keys(block.properties).length);
};

const hasBindings = (block: BuilderElement) => {
  return Boolean(block.bindings && Object.keys(block.bindings).length);
};

const hasStyles = (block: BuilderElement) => {
  if (block.responsiveStyles) {
    for (const key in block.responsiveStyles) {
      if (Object.keys((block.responsiveStyles as any)[key]!).length) {
        return true;
      }
    }
  }
  return false;
};

type InternalOptions = {
  skipMapper?: boolean;
};

const wrapBindingIfNeeded = (value: string, options: BuilderToMitosisOptions) => {
  if (options.includeBuilderExtras) {
    return wrapBinding(value);
  }

  if (value?.includes(';') && !value?.trim().startsWith('{')) {
    return `{ ${value} }`;
  }

  return value;
};

const getBlockActions = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const obj = {
    ...block.actions,
    ...block.code?.actions,
  };
  if (options.includeBuilderExtras) {
    for (const key in obj) {
      const value = obj[key];
      // TODO: plugin/option for for this
      obj[key] = wrapBinding(value);
    }
  }
  return obj;
};

const getBlockActionsAsBindings = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  return mapKeys(getBlockActions(block, options), (value, key) => `on${capitalize(key)}`);
};

const isValidBindingKey = (str: string) => {
  return Boolean(str && /^[a-z0-9_\.]$/i.test(str));
};

const getBlockNonActionBindings = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const obj = {
    ...block.bindings,
    ...block.code?.bindings,
  };
  if (options.includeBuilderExtras) {
    for (const key in obj) {
      if (!isValidBindingKey(key)) {
        console.warn('Skipping invalid binding key:', key);
        continue;
      }
      const value = obj[key];
      // TODO: verify the bindings are valid

      let { valid, error } = verifyIsValid(value);
      if (!valid) {
        ({ valid, error } = verifyIsValid(`function () {  ${value} }`));
      }
      if (valid) {
        obj[key] = wrapBinding(value);
      } else {
        console.warn('Skipping invalid code:', error);
        delete obj[key];
      }
    }
  }
  return obj;
};

function wrapBinding(value: string): string;
function wrapBinding(value: undefined): undefined;
function wrapBinding(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  if (!(value.includes(';') || value.match(/(^|\s|;)return[^a-z0-9A-Z]/))) {
    return value;
  }
  return `(() => {
    try { ${isExpression(value) ? 'return ' : ''}${value} }
    catch (err) {
      console.warn('Builder code error', err);
    }
  })()`;
}

const getBlockBindings = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const obj = {
    ...getBlockNonActionBindings(block, options),
    ...getBlockActionsAsBindings(block, options),
  };

  return obj;
};

// add back if this direction (blocks as children not prop) is desired
export const symbolBlocksAsChildren = false;

const componentMappers: {
  [key: string]: (block: BuilderElement, options: BuilderToMitosisOptions) => MitosisNode;
} = {
  Symbol(block, options) {
    let css = getCssFromBlock(block);
    const styleString = getStyleStringFromBlock(block, options);
    const actionBindings = getActionBindingsFromBlock(block, options);

    const bindings: Dictionary<Binding> = {
      symbol: createSingleBinding({
        code: JSON.stringify({
          ...block.component?.options.symbol,
        }),
      }),
      ...actionBindings,
      ...(styleString && {
        style: createSingleBinding({ code: styleString }),
      }),
      ...(Object.keys(css).length && {
        css: createSingleBinding({ code: JSON.stringify(css) }),
      }),
    };

    return createMitosisNode({
      name: 'Symbol',
      bindings: bindings,
      meta: getMetaFromBlock(block, options),
    });
  },
  ...(!symbolBlocksAsChildren
    ? {}
    : {
        Symbol(block, options) {
          let css = getCssFromBlock(block);
          const styleString = getStyleStringFromBlock(block, options);
          const actionBindings = getActionBindingsFromBlock(block, options);

          const content = block.component?.options.symbol.content;
          const blocks = content?.data?.blocks;
          if (blocks) {
            content.data.blocks = null;
          }

          return createMitosisNode({
            name: 'Symbol',
            bindings: {
              // TODO: this doesn't use all attrs
              symbol: createSingleBinding({
                code: JSON.stringify({
                  data: block.component?.options.symbol.content.data,
                  content: content, // TODO: convert to <SymbolInternal>...</SymbolInternal> so can be parsed
                }),
              }),
              ...actionBindings,
              ...(styleString && {
                style: createSingleBinding({ code: styleString }),
              }),
              ...(Object.keys(css).length && {
                css: createSingleBinding({ code: JSON.stringify(css) }),
              }),
            },
            meta: getMetaFromBlock(block, options),
            children: !blocks
              ? []
              : [
                  createMitosisNode({
                    // TODO: the Builder generator side of this converting to blocks
                    name: 'BuilderSymbolContents',
                    children: blocks.map((item: any) => builderElementToMitosisNode(item, options)),
                  }),
                ],
          });
        },
      }),
  Columns(block, options) {
    const node = builderElementToMitosisNode(block, options, {
      skipMapper: true,
    });

    delete node.bindings.columns;
    delete node.properties.columns;

    node.children =
      block.component?.options.columns?.map((col: any, index: number) =>
        createMitosisNode({
          name: 'Column',
          /**
           * If width if undefined, do not create a binding otherwise its JSX will
           * be <Column width={} /> which is not valid due to the empty expression.
           */
          ...(col.width != null && {
            bindings: {
              width: { code: col.width.toString() },
            },
          }),
          ...(col.link && {
            properties: {
              link: col.link,
            },
          }),
          meta: getMetaFromBlock(block, options),
          children: col.blocks.map((col: any) => builderElementToMitosisNode(col, options)),
        }),
      ) || [];

    return node;
  },
  PersonalizationContainer(block, options) {
    const node = builderElementToMitosisNode(block, options, {
      skipMapper: true,
    });

    delete node.bindings.variants;
    delete node.properties.variants;

    const newChildren: MitosisNode[] =
      block.component?.options.variants?.map((variant: any) => {
        const variantNode = createMitosisNode({
          name: 'Variant',
          properties: {
            name: variant.name,
            startDate: variant.startDate,
            endDate: variant.endDate,
          },
          meta: getMetaFromBlock(block, options),
          children: variant.blocks.map((col: any) => builderElementToMitosisNode(col, options)),
        });
        const queryOptions = variant.query as any[];
        if (Array.isArray(queryOptions)) {
          variantNode.bindings.query = createSingleBinding({
            code: JSON.stringify(queryOptions.map((q) => omit(q, '@type'))),
          });
        } else if (queryOptions) {
          variantNode.bindings.query = createSingleBinding({
            code: JSON.stringify(omit(queryOptions, '@type')),
          });
        }
        return variantNode;
      }) || [];

    const defaultVariant = createMitosisNode({
      name: 'Variant',
      properties: {
        default: '',
      },
      children: node.children,
    });
    newChildren.push(defaultVariant);

    node.children = newChildren;
    return node;
  },
  'Shopify:For': (block, options) => {
    return createMitosisNode({
      name: 'For',
      bindings: {
        each: createSingleBinding({
          code: `state.${block.component!.options!.repeat!.collection}`,
        }),
      },
      scope: {
        forName: block.component!.options!.repeat!.itemName,
      },
      meta: getMetaFromBlock(block, options),
      children: (block.children || []).map((child) =>
        builderElementToMitosisNode(updateBindings(child, 'state.$index', 'index'), options),
      ),
    });
  },
};

type BuilderToMitosisOptions = {
  context?: { [key: string]: any };
  includeBuilderExtras?: boolean;
  preserveTextBlocks?: boolean;
  includeSpecialBindings?: boolean;
  includeMeta?: boolean;
  /**
   * When `true`, invalid bindings will be escaped as strings with special comments.
   * This can then be used to have LLMs such as Claude attempt to repair the broken code.
   * Defaults to `false`.
   */
  escapeInvalidCode?: boolean;

  /**
   * When `true`, the `blocksSlots` field on Mitosis Nodes will be used to transform
   * deeply nested Builder elements found in component options. Note that not every
   * generator supports parsing `blocksSlots`.
   * Defaults to `false`.
   */
  enableBlocksSlots?: boolean;
};

export const builderElementToMitosisNode = (
  block: BuilderElement,
  options: BuilderToMitosisOptions,
  _internalOptions: InternalOptions = {},
): MitosisNode => {
  const { includeSpecialBindings = true } = options;
  const localizedValues: MitosisNode['localizedValues'] = {};

  if (block.component?.name === 'Core:Fragment') {
    block.component.name = 'Fragment';
  }
  const forBinding = block.repeat?.collection;
  if (forBinding) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createMitosisNode({
        name: 'For',
        bindings: {
          each: createSingleBinding({
            code: wrapBindingIfNeeded(block.repeat?.collection!, options),
          }),
        },
        scope: {
          forName: block.repeat?.itemName || 'item',
        },
        meta: getMetaFromBlock(block, options),
        children:
          block.children?.map((child) =>
            builderElementToMitosisNode(updateBindings(child, 'state.$index', 'index'), options),
          ) || [],
      });
    } else {
      const useBlock =
        block.component?.name === 'Core:Fragment' && block.children?.length === 1
          ? block.children[0]
          : block;
      return createMitosisNode({
        name: 'For',
        bindings: {
          each: createSingleBinding({
            code: wrapBindingIfNeeded(block.repeat?.collection!, options),
          }),
        },
        scope: {
          forName: block.repeat?.itemName || 'item',
          indexName: '$index',
        },
        meta: getMetaFromBlock(block, options),
        children: [builderElementToMitosisNode(omit(useBlock, 'repeat'), options)],
      });
    }
  }
  // Special builder properties
  // TODO: support hide and repeat
  const blockBindings = getBlockBindings(block, options);
  let code: string | undefined = undefined;
  if (blockBindings.show) {
    code = wrapBindingIfNeeded(blockBindings.show, options);
  } else if (blockBindings.hide) {
    code = `!(${wrapBindingIfNeeded(blockBindings.hide, options)})`;
  }
  if (code) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createMitosisNode({
        name: 'Show',
        bindings: { when: createSingleBinding({ code }) },
        meta: getMetaFromBlock(block, options),
        children: block.children?.map((child) => builderElementToMitosisNode(child, options)) || [],
      });
    } else {
      return createMitosisNode({
        name: 'Show',
        bindings: { when: createSingleBinding({ code }) },
        meta: getMetaFromBlock(block, options),
        children: [
          builderElementToMitosisNode(
            {
              ...block,
              code: {
                ...block.code,
                bindings: omit(blockBindings, 'show', 'hide'),
              },
              bindings: omit(blockBindings, 'show', 'hide'),
            },
            options,
          ),
        ],
      });
    }
  }
  const mapper =
    !_internalOptions.skipMapper && block.component && componentMappers[block.component!.name];

  if (mapper) {
    return mapper(block, options);
  }

  const bindings: MitosisNode['bindings'] = {};
  const children: MitosisNode[] = [];
  const slots: MitosisNode['slots'] = {};
  const blocksSlots: MitosisNode['blocksSlots'] = {};

  if (blockBindings) {
    for (const key in blockBindings) {
      if (key === 'css') {
        continue;
      }
      const useKey = key.replace(/^(component\.)?options\./, '');
      if (!useKey.includes('.')) {
        let code = (blockBindings[key] as any).code || blockBindings[key];

        const verifyCode = verifyIsValid(code);
        if (!verifyCode.valid) {
          if (options.escapeInvalidCode) {
            code = '`' + code + ' [INVALID CODE]`';
          } else {
            console.warn(`Dropping binding "${key}" due to invalid code: ${code}`);
            continue;
          }
        }

        bindings[useKey] = createSingleBinding({
          code,
        });
      } else if (useKey.includes('style') && useKey.includes('.')) {
        const styleProperty = useKey.split('.')[1];
        // TODO: add me in
        // styleBindings[styleProperty] =
        //   block.code?.bindings?.[key] || blockBindings[key];
      }
    }
  }

  const properties: { [key: string]: string } = {
    ...block.properties,
    ...(options.includeBuilderExtras && {
      ['builder-id']: block.id!,
      // class: `builder-block ${block.id} ${block.properties?.class || ''}`,
    }),
    ...(options.includeBuilderExtras && getBuilderPropsForSymbol(block)),
  };
  for (const key in properties) {
    if (
      typeof properties[key] === 'object' &&
      properties[key] !== null &&
      (properties[key] as any)['@type'] === '@builder.io/core:LocalizedValue'
    ) {
      const localizedValue = properties[key] as unknown as BuilderLocalizedValue;
      localizedValues[`properties.${key}`] = localizedValue;
      properties[key] = localizedValue.Default;
    }
  }

  if (block.layerName) {
    properties.$name = block.layerName;
  }

  const linkUrl = (block as any).linkUrl;
  if (linkUrl) {
    if (
      typeof linkUrl === 'object' &&
      linkUrl !== null &&
      linkUrl['@type'] === '@builder.io/core:LocalizedValue'
    ) {
      properties.href = linkUrl.Default;
      localizedValues['linkUrl'] = linkUrl;
    } else {
      properties.href = linkUrl;
    }
  }

  if (block.component?.options) {
    for (const key in block.component.options) {
      const value = block.component.options[key];
      const valueIsArrayOfBuilderElements = Array.isArray(value) && value.every(isBuilderElement);

      const transformBldrElementToMitosisNode = (item: BuilderElement) => {
        const node = builderElementToMitosisNode(item, {
          ...options,
          includeSpecialBindings: false,
        });

        return node;
      };

      if (isBuilderElement(value)) {
        slots[key] = [transformBldrElementToMitosisNode(value)];
      } else if (typeof value === 'string') {
        properties[key] = value;
      } else if (
        typeof value === 'object' &&
        value !== null &&
        value['@type'] === '@builder.io/core:LocalizedValue'
      ) {
        properties[key] = value.Default;
        localizedValues[`component.options.${key}`] = value;
      } else if (valueIsArrayOfBuilderElements) {
        const childrenElements = value
          .filter((item) => {
            if (item.properties?.src?.includes('/api/v1/pixel')) {
              return false;
            }
            return true;
          })
          .map(transformBldrElementToMitosisNode);

        slots[key] = childrenElements;
      } else if (
        options.enableBlocksSlots &&
        !componentMappers[block.component?.name] &&
        (Array.isArray(value) || (typeof value === 'object' && value !== null))
      ) {
        /**
         * Builder Elements that have their own mappers should not use blocksSlots
         * even if the mapper is disabled via _internalOptions as it will cause
         * problems when trying to use the mapper in the future.
         */
        const data = Array.isArray(value) ? [...value] : { ...value };
        let hasElement = false;
        traverse(data).forEach(function (d) {
          if (isBuilderElement(d)) {
            /**
             * Replacing the Builder element with a Mitosis node in-place
             * allows us to assign to blockSlots while preserving the structure
             * of this deeply nested data.
             */
            this.update(builderElementToMitosisNode(d, options, _internalOptions));
            hasElement = true;
          }
        });

        // If no elements were updated then this is just a regular binding
        if (hasElement) {
          blocksSlots[key] = data;
        } else {
          bindings[key] = createSingleBinding({ code: json5.stringify(value) });
        }
      } else {
        bindings[key] = createSingleBinding({ code: json5.stringify(value) });
      }
    }
  }

  const css = getCssFromBlock(block);
  let styleString = getStyleStringFromBlock(block, options);
  const actionBindings = getActionBindingsFromBlock(block, options);
  for (const binding in blockBindings) {
    if (binding.startsWith('component.options') || binding.startsWith('options')) {
      const value = blockBindings[binding];
      const useKey = binding.replace(/^(component\.options\.|options\.)/, '');
      bindings[useKey] = createSingleBinding({ code: value });
    }
  }

  // Add data attributes for Builder layer properties
  const dataAttributes: Record<string, string> = {};
  if (block.layerLocked !== undefined) {
    dataAttributes['data-builder-layerLocked'] = String(block.layerLocked);
  }
  if (block.groupLocked !== undefined) {
    dataAttributes['data-builder-groupLocked'] = String(block.groupLocked);
  }

  const node = createMitosisNode({
    name:
      block.component?.name?.replace(/[^a-z0-9]/gi, '') ||
      block.tagName ||
      ((block as any).linkUrl ? 'a' : 'div'),
    properties: {
      ...(block.component && includeSpecialBindings && { $tagName: block.tagName }),
      ...(block.class && { class: block.class }),
      ...properties,
      ...dataAttributes,
    },
    bindings: {
      ...bindings,
      ...actionBindings,
      ...(styleString && {
        style: createSingleBinding({ code: styleString }),
      }),
      ...(css &&
        Object.keys(css).length && {
          css: createSingleBinding({ code: JSON.stringify(css) }),
        }),
    },
    slots: {
      ...slots,
    },
    ...(Object.keys(blocksSlots).length > 0 && { blocksSlots }),
    meta: getMetaFromBlock(block, options),
    ...(Object.keys(localizedValues).length && { localizedValues }),
  });

  node.children = children.concat(
    (block.children || []).map((item) => builderElementToMitosisNode(item, options)),
  );

  return node;
};

const getBuilderPropsForSymbol = (
  block: BuilderElement,
): undefined | { 'builder-content-id': string } => {
  if (block.children?.length === 1) {
    const child = block.children[0];
    const builderContentId = child.properties?.['builder-content-id'];
    if (builderContentId) {
      return { 'builder-content-id': builderContentId };
    }
  }
  return undefined;
};

export const getMetaFromBlock = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const { includeMeta = false } = options;
  return includeMeta
    ? {
        'builder-id': block.id,
        ...block.meta,
      }
    : {};
};

const getHooks = (content: BuilderContent) => {
  const code = convertExportDefaultToReturn(content.data?.tsCode || content.data?.jsCode || '');
  try {
    return parseJsx(`
    export default function TemporaryComponent() {
      ${
        // Mitosis parser looks for useStore to be a variable assignment,
        // but in Builder that's not how it works. For now do a replace to
        // easily resuse the same parsing code as this is the only difference
        code.replace(`useStore(`, `var state = useStore(`)
      }
    }`);
  } catch (err) {
    console.warn('Could not parse js code as a Mitosis component body', err, code);
    return null;
  }
};

/**
 * Take Builder custom jsCode and extract the contents of the useStore hook
 * and return it as a JS object along with the inputted code with the hook
 * code extracted
 */
export function extractStateHook(code: string): {
  code: string;
  state: MitosisState;
} {
  const { types } = babel;
  let state: MitosisState = {};
  const body = parseCode(code);
  const newBody = body.slice();
  for (let i = 0; i < body.length; i++) {
    const statement = body[i];
    if (types.isExpressionStatement(statement)) {
      const { expression } = statement;
      // Check for useStore
      if (types.isCallExpression(expression)) {
        if (types.isIdentifier(expression.callee) && expression.callee.name === 'useStore') {
          const arg = expression.arguments[0];
          if (types.isObjectExpression(arg)) {
            state = parseStateObjectToMitosisState(arg);
            newBody.splice(i, 1);
          }
        }

        if (types.isMemberExpression(expression.callee)) {
          if (
            types.isIdentifier(expression.callee.object) &&
            expression.callee.object.name === 'Object'
          ) {
            if (
              types.isIdentifier(expression.callee.property) &&
              expression.callee.property.name === 'assign'
            ) {
              const arg = expression.arguments[1];
              if (types.isObjectExpression(arg)) {
                state = parseStateObjectToMitosisState(arg);
                newBody.splice(i, 1);
              }
            }
          }
        }
      }
    }
  }

  const newCode = generate(types.program(newBody)).code || '';

  return { code: newCode, state };
}

export function convertExportDefaultToReturn(code: string) {
  try {
    const { types } = babel;
    const body = parseCode(code);
    if (body.length === 0) return code;
    const newBody = body.slice();
    for (let i = 0; i < body.length; i++) {
      const statement = body[i];
      if (types.isExportDefaultDeclaration(statement)) {
        if (
          types.isCallExpression(statement.declaration) ||
          types.isExpression(statement.declaration)
        ) {
          newBody[i] = types.returnStatement(statement.declaration);
        }
      }
    }

    return generate(types.program(newBody)).code || '';
  } catch (e) {
    const error = e as { code?: string; reasonCode?: string };
    if (error.code === 'BABEL_PARSE_ERROR') {
      return code;
    } else {
      throw e;
    }
  }
}

const updateBindings = (node: BuilderElement, from: string, to: string) => {
  traverse(node).forEach(function (item) {
    if (isBuilderElement(item)) {
      if (item.bindings) {
        for (const [key, value] of Object.entries(item.bindings)) {
          if (value?.includes(from)) {
            item.bindings[key] = value.replaceAll(from, to);
          }
        }
      }
      if (item.actions) {
        for (const [key, value] of Object.entries(item.actions)) {
          if (value?.includes(from)) {
            item.actions[key] = value.replaceAll(from, to);
          }
        }
      }
    }
  });

  return node;
};

// TODO: maybe this should be part of the builder -> Mitosis part
function extractSymbols(json: BuilderContent) {
  const subComponents: { content: BuilderContent; name: string }[] = [];

  const symbols: { element: BuilderElement; depth: number; id: string }[] = [];

  traverse(json).forEach(function (item) {
    if (isBuilderElement(item)) {
      if (item.component?.name === 'Symbol') {
        symbols.push({ element: item, depth: this.path.length, id: item.id! });
      }
    }
  });

  const symbolsSortedDeepestFirst = sortBy(symbols, (info) => info.depth)
    .reverse()
    .map((el) => el.element);

  let symbolsFound = 0;

  for (const el of symbolsSortedDeepestFirst) {
    const symbolValue = el.component?.options?.symbol;
    const elContent = symbolValue?.content;

    if (!elContent) {
      console.warn('Symbol missing content', el.id);
      if (el.component?.options.symbol.content) {
        delete el.component.options.symbol.content;
      }
      continue;
    }

    const componentName = 'Symbol' + ++symbolsFound;

    el.component!.name = componentName;

    if (el.component?.options.symbol.content) {
      delete el.component.options.symbol.content;
    }

    subComponents.push({
      content: elContent,
      name: componentName,
    });
  }

  return {
    content: json,
    subComponents,
  };
}

export const createBuilderElement = (options?: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  id: 'builder-' + hashCodeAsString(options),
  ...options,
});

export const isBuilderElement = (el: unknown): el is BuilderElement =>
  (el as any)?.['@type'] === '@builder.io/sdk:Element';

const builderContentPartToMitosisComponent = (
  builderContent: BuilderContent,
  options: BuilderToMitosisOptions = {},
) => {
  builderContent = fastClone(builderContent);
  traverse(builderContent).forEach(function (elem) {
    if (isBuilderElement(elem)) {
      // Try adding self-closing tags to void elements, since Builder Text
      // blocks can contain arbitrary HTML
      // List taken from https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
      // TODO: Maybe this should be using something more robust than a regular expression
      const voidElemRegex =
        /(<area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr[^>]+)>/gm;

      try {
        if (elem.component?.name === 'Text') {
          const text = elem.component.options.text;
          elem.component.options.text = text.replace(voidElemRegex, '$1 />');
          // Remove broken emojis
          const hasUnpairedSurrogate =
            /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g;
          if (hasUnpairedSurrogate.test(text)) {
            elem.component.options.text = text.replace(hasUnpairedSurrogate, '');
          }
        }
      } catch (_error) {
        // pass
      }

      try {
        if (elem.component?.name === 'Custom Code') {
          elem.component.options.code = elem.component.options.code.replace(voidElemRegex, '$1 />');
        }
      } catch (_error) {
        // pass
      }
    }
  });

  const { state, code } = extractStateHook(
    builderContent?.data?.tsCode || builderContent?.data?.jsCode || '',
  );
  const customCode = convertExportDefaultToReturn(code);

  const parsed = getHooks(builderContent);

  const parsedState = parsed?.state || {};

  const mitosisState =
    Object.keys(parsedState).length > 0
      ? parsedState
      : {
          ...state,
          ...mapBuilderContentStateToMitosisState(builderContent.data?.state || {}),
        };

  const componentJson = createMitosisComponent({
    meta: {
      useMetadata: {
        httpRequests: builderContent.data?.httpRequests,
      },
      // cmp.meta.cssCode exists for backwards compatibility, prefer cmp.style
      ...(builderContent.data?.cssCode && { cssCode: builderContent.data.cssCode }),
    },
    ...(builderContent.data?.cssCode && { style: builderContent.data?.cssCode }),
    inputs: builderContent.data?.inputs?.map((input) => ({
      name: input.name,
      defaultValue: input.defaultValue,
    })),
    state: mitosisState,
    hooks: {
      onMount: [
        ...(parsed?.hooks.onMount.length
          ? parsed?.hooks.onMount
          : customCode
          ? [{ code: customCode }]
          : []),
      ],
    },
    children: (builderContent.data?.blocks || [])
      .filter((item) => {
        if (item.properties?.src?.includes('/api/v1/pixel')) {
          return false;
        }
        return true;
      })
      .map((item) => builderElementToMitosisNode(item, options)),
  });

  return componentJson;
};

export const builderContentToMitosisComponent = (
  builderContent: BuilderContent,
  options: BuilderToMitosisOptions = {},
): MitosisComponent => {
  builderContent = fastClone(builderContent);

  const separated = extractSymbols(builderContent);

  const componentJson: MitosisComponent = {
    ...builderContentPartToMitosisComponent(separated.content, options),
    subComponents: separated.subComponents.map((item) => ({
      ...builderContentPartToMitosisComponent(item.content, options),
      name: item.name,
    })),
  };

  return componentJson;
};

function mapBuilderBindingsToMitosisBindingWithCode(
  bindings: { [key: string]: string } | undefined,
): MitosisNode['bindings'] {
  const result: MitosisNode['bindings'] = {};
  bindings &&
    Object.keys(bindings).forEach((key) => {
      const value: string | { code: string } = bindings[key] as any;
      if (typeof value === 'string') {
        result[key] = createSingleBinding({ code: value });
      } else if (value && typeof value === 'object' && value.code) {
        result[key] = createSingleBinding({ code: value.code });
      } else {
        throw new Error('Unexpected binding value: ' + JSON.stringify(value));
      }
    });
  return result;
}

type Styles = Record<string, any>;

function combineStyles(parent: Styles, child: Styles) {
  const marginStyles = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
  const paddingStyles = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'];
  const distanceStylesToCombine = [...paddingStyles, ...marginStyles];
  const merged: Styles = {
    ...omit(child, distanceStylesToCombine),
    ...parent,
  };
  for (const key of distanceStylesToCombine) {
    // Funky things happen if different alignment
    if (parent.alignSelf !== child.alignSelf && (key === 'marginLeft' || key === 'marginRight')) {
      merged[key] = parent[key];
      continue;
    }
    const childNum = parseFloat(child[key]) || 0;
    const parentKeyToUse = key.replace(/margin/, 'padding');
    const parentNum = parseFloat(parent[parentKeyToUse]) || 0;
    if (childNum || parentNum) {
      merged[parentKeyToUse] = `${childNum + parentNum}px`;
    }
  }

  for (const [key, value] of Object.entries(merged)) {
    if (value && typeof value === 'object') {
      merged[key] = combineStyles(parent[key] || {}, child[key] || {});
    }
  }
  return merged;
}
