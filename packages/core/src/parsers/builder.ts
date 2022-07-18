import * as babel from '@babel/core';
import generate from '@babel/generator';
import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { mapKeys, merge, omit, omitBy, sortBy, upperFirst } from 'lodash';
import { fastClone } from '../helpers/fast-clone';
import traverse from 'traverse';
import { Size, sizeNames, sizes } from '../constants/media-sizes';
import { capitalize } from '../helpers/capitalize';
import { createMitosisComponent } from '../helpers/create-mitosis-component';
import { createMitosisNode } from '../helpers/create-mitosis-node';
import { MitosisNode } from '../types/mitosis-node';
import { parseJsx, parseStateObject } from './jsx';
import { parseCode, isExpression } from '../helpers/parsers';
import { hashCodeAsString } from '..';

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
  let css: { [key: string]: Partial<CSSStyleDeclaration> } = {};
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
          ...css[mediaQueryKey],
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

const getActionBindingsFromBlock = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const actions = {
    ...block.actions,
    ...block.code?.actions,
  };
  const bindings: any = {};
  const actionKeys = Object.keys(actions);
  if (actionKeys.length) {
    for (const key of actionKeys) {
      const value = actions[key];
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
      bindings[useKey] = { code: `${wrapBindingIfNeeded(value, options)}` };
    }
  }

  return bindings;
};

const getStyleStringFromBlock = (block: BuilderElement, options: BuilderToMitosisOptions) => {
  const styleBindings: any = {};
  let styleString = '';

  if (block.bindings) {
    for (const key in block.bindings) {
      if (key.includes('style') && key.includes('.')) {
        const styleProperty = key.split('.')[1];
        styleBindings[styleProperty] = convertExportDefaultToReturn(
          block.code?.bindings?.[key] || block.bindings[key],
        );
      }
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

const wrapBinding = (value: string) => {
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
};

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

    return createMitosisNode({
      name: 'Symbol',
      bindings: {
        symbol: {
          code: JSON.stringify({
            data: block.component?.options.symbol.data,
            content: block.component?.options.symbol.content,
          }),
        },
        ...actionBindings,
        ...(styleString && {
          style: { code: styleString },
        }),
        ...(Object.keys(css).length && {
          css: { code: JSON.stringify(css) },
        }),
      },
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
              symbol: {
                code: JSON.stringify({
                  data: block.component?.options.symbol.content.data,
                  content: content, // TODO: convert to <SymbolInternal>...</SymbolInternal> so can be parsed
                }),
              },
              ...actionBindings,
              ...(styleString && {
                style: { code: styleString },
              }),
              ...(Object.keys(css).length && {
                css: { code: JSON.stringify(css) },
              }),
            },
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

    node.children = block.component?.options.columns?.map((col: any, index: number) =>
      createMitosisNode({
        name: 'Column',
        bindings: {
          width: { code: col.width },
        },
        ...(col.link && {
          properties: {
            link: col.link,
          },
        }),
        children: col.blocks.map((col: any) => builderElementToMitosisNode(col, options)),
      }),
    );

    return node;
  },
  'Shopify:For': (block, options) => {
    return createMitosisNode({
      name: 'For',
      bindings: {
        each: { code: `state.${block.component!.options!.repeat!.collection}` },
      },
      properties: {
        _forName: block.component!.options!.repeat!.itemName,
      },
      children: (block.children || []).map((child) => builderElementToMitosisNode(child, options)),
    });
  },
  Text: (block, options) => {
    let css = getCssFromBlock(block);
    const styleString = getStyleStringFromBlock(block, options);
    const actionBindings = getActionBindingsFromBlock(block, options);

    const blockBindings = {
      ...block.code?.bindings,
      ...block.bindings,
    };

    const bindings: any = {
      ...omitBy(blockBindings, (value, key) => {
        if (key === 'component.options.text') {
          return true;
        }

        if (key && key.includes('style')) {
          return true;
        }

        return false;
      }),
      ...actionBindings,
      ...(styleString && {
        style: { code: styleString },
      }),
      ...(Object.keys(css).length && {
        css: { code: JSON.stringify(css) },
      }),
    };
    const properties = { ...block.properties };

    if (block.layerName) {
      properties.$name = block.layerName;
    }

    const innerBindings = {
      [options.preserveTextBlocks ? 'innerHTML' : '_text']: {
        code: wrapBindingIfNeeded(blockBindings['component.options.text'], options),
      },
    };
    const innerProperties = {
      [options.preserveTextBlocks ? 'innerHTML' : '_text']: block.component!.options.text,
    };

    if (options.preserveTextBlocks) {
      return createMitosisNode({
        name: block.tagName || 'div',
        bindings,
        properties,
        children: [
          createMitosisNode({
            bindings: innerBindings,
            properties: {
              ...innerProperties,
              class: 'builder-text',
            },
          }),
        ],
      });
    }

    if ((block.tagName && block.tagName !== 'div') || hasStyles(block)) {
      return createMitosisNode({
        name: block.tagName || 'div',
        bindings,
        properties,
        children: [
          createMitosisNode({
            bindings: innerBindings,
            properties: innerProperties,
          }),
        ],
      });
    }

    return createMitosisNode({
      name: block.tagName || 'div',
      properties: {
        ...properties,
        ...innerProperties,
      },
      bindings: {
        ...bindings,
        ...innerBindings,
      },
    });
  },
};

export type BuilderToMitosisOptions = {
  context?: { [key: string]: any };
  includeBuilderExtras?: boolean;
  preserveTextBlocks?: boolean;
};
export type InternalBuilderToMitosisOptions = BuilderToMitosisOptions & {
  context: { [key: string]: any };
};

export const builderElementToMitosisNode = (
  block: BuilderElement,
  options: BuilderToMitosisOptions,
  _internalOptions: InternalOptions = {},
): MitosisNode => {
  if (block.component?.name === 'Core:Fragment') {
    block.component.name = 'Fragment';
  }
  // Special builder properties
  // TODO: support hide and repeat
  const blockBindings = getBlockBindings(block, options);
  const showBinding = blockBindings.show;
  if (showBinding) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createMitosisNode({
        name: 'Show',
        bindings: {
          when: { code: wrapBindingIfNeeded(showBinding, options) },
        },
        children: block.children?.map((child) => builderElementToMitosisNode(child, options)) || [],
      });
    } else {
      return createMitosisNode({
        name: 'Show',
        bindings: {
          when: { code: wrapBindingIfNeeded(showBinding, options) },
        },
        children: [
          builderElementToMitosisNode(
            {
              ...block,
              code: {
                ...block.code,
                bindings: omit(blockBindings, 'show'),
              },
              bindings: omit(blockBindings, 'show'),
            },
            options,
          ),
        ],
      });
    }
  }
  const forBinding = block.repeat?.collection;
  if (forBinding) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createMitosisNode({
        name: 'For',
        bindings: {
          each: {
            code: wrapBindingIfNeeded(block.repeat?.collection!, options),
          },
        },
        properties: {
          _forName: block.repeat?.itemName || 'item',
        },
        children: block.children?.map((child) => builderElementToMitosisNode(child, options)) || [],
      });
    } else {
      const useBlock =
        block.component?.name === 'Core:Fragment' && block.children?.length === 1
          ? block.children[0]
          : block;
      return createMitosisNode({
        name: 'For',
        bindings: {
          each: {
            code: wrapBindingIfNeeded(block.repeat?.collection!, options),
          },
        },
        properties: {
          _forName: block.repeat?.itemName || 'item',
        },
        children: [builderElementToMitosisNode(omit(useBlock, 'repeat'), options)],
      });
    }
  }
  const mapper =
    !_internalOptions.skipMapper && block.component && componentMappers[block.component!.name];

  if (mapper) {
    return mapper(block, options);
  }

  const bindings: any = {};

  if (blockBindings) {
    for (const key in blockBindings) {
      if (key === 'css') {
        continue;
      }
      const useKey = key.replace(/^(component\.)?options\./, '');
      if (!useKey.includes('.')) {
        bindings[useKey] = {
          code: (blockBindings[key] as any).code || blockBindings[key],
        };
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
  };

  if (block.layerName) {
    properties.$name = block.layerName;
  }

  if ((block as any).linkUrl) {
    properties.href = (block as any).linkUrl;
  }

  if (block.component?.options) {
    for (const key in block.component.options) {
      const value = block.component.options[key];
      if (typeof value === 'string') {
        properties[key] = value;
      } else {
        bindings[key] = { code: json5.stringify(value) };
      }
    }
  }

  if (block.component && block.tagName && block.tagName !== 'div') {
    properties.builderTag = block.tagName;
  }

  const css = getCssFromBlock(block);
  let styleString = getStyleStringFromBlock(block, options);
  const actionBindings = getActionBindingsFromBlock(block, options);
  for (const binding in blockBindings) {
    if (binding.startsWith('component.options') || binding.startsWith('options')) {
      const value = blockBindings[binding];
      const useKey = binding.replace(/^(component\.options\.|options\.)/, '');
      bindings[useKey] = { code: value };
    }
  }

  const node = createMitosisNode({
    name:
      block.component?.name?.replace(/[^a-z0-9]/gi, '') ||
      block.tagName ||
      ((block as any).linkUrl ? 'a' : 'div'),
    properties: {
      ...(block.component
        ? {
            $tagName: block.tagName,
          }
        : null),
      ...properties,
    },
    bindings: {
      ...bindings,
      ...actionBindings,
      ...(styleString && {
        style: { code: styleString },
      }),
      ...(css &&
        Object.keys(css).length && {
          css: { code: JSON.stringify(css) },
        }),
    },
  });

  // Has single text node child
  if (
    block.children?.length === 1 &&
    block.children[0].component?.name === 'Text' &&
    !options.preserveTextBlocks
  ) {
    const textProperties = builderElementToMitosisNode(block.children[0], options);
    const mergedCss = merge(
      json5.parse(node.bindings.css?.code || '{}'),
      json5.parse(textProperties.bindings.css?.code || '{}'),
    );
    return merge({}, textProperties, node, {
      bindings: {
        ...(Object.keys(mergedCss).length && {
          css: { code: json5.stringify(mergedCss) },
        }),
      },
    });
  }

  node.children = (block.children || []).map((item) => builderElementToMitosisNode(item, options));

  return node;
};

const getHooks = (content: BuilderContent) => {
  const code = convertExportDefaultToReturn(content.data?.tsCode || content.data?.jsCode || '');
  try {
    return parseJsx(`
    export default function TemporaryComponent() {
      ${
        // Mitosis parser looks for useState to be a variable assignment,
        // but in Builder that's not how it works. For now do a replace to
        // easily resuse the same parsing code as this is the only difference
        code.replace(`useState(`, `var state = useState(`)
      }
    }`);
  } catch (err) {
    console.warn('Could not parse js code as a Mitosis component body', err, code);
    return null;
  }
};

/**
 * Take Builder custom jsCode and extract the contents of the useState hook
 * and return it as a JS object along with the inputted code with the hook
 * code extracted
 */
export function extractStateHook(code: string) {
  const { types } = babel;
  let state: any = {};
  const body = parseCode(code);
  const newBody = body.slice();
  for (let i = 0; i < body.length; i++) {
    const statement = body[i];
    if (types.isExpressionStatement(statement)) {
      const { expression } = statement;
      // Check for useState
      if (types.isCallExpression(expression)) {
        if (types.isIdentifier(expression.callee) && expression.callee.name === 'useState') {
          const arg = expression.arguments[0];
          if (types.isObjectExpression(arg)) {
            state = parseStateObject(arg);
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
                state = parseStateObject(arg);
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
  const { types } = babel;
  const body = parseCode(code);
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
}

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
      delete el.component?.options.symbol.content;
      continue;
    }

    const componentName = 'Symbol' + ++symbolsFound;

    el.component!.name = componentName;

    delete el.component?.options.symbol.content;

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
          elem.component.options.text = elem.component.options.text.replace(voidElemRegex, '$1 />');
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

  const componentJson = createMitosisComponent({
    meta: {
      useMetadata: {
        httpRequests: builderContent.data?.httpRequests,
      },
    },
    inputs: builderContent.data?.inputs?.map((input) => ({
      name: input.name,
      defaultValue: input.defaultValue,
    })),
    state: parsed?.state || {
      ...state,
      ...builderContent.data?.state,
    },
    hooks: {
      ...((parsed?.hooks.onMount?.code || (customCode && { code: customCode })) && {
        onMount: parsed?.hooks.onMount || { code: customCode },
      }),
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
) => {
  builderContent = fastClone(builderContent);

  const separated = extractSymbols(builderContent);

  const componentJson = {
    ...builderContentPartToMitosisComponent(separated.content, options),
    subComponents: separated.subComponents.map((item) => ({
      ...builderContentPartToMitosisComponent(item.content, options),
      name: item.name,
    })),
  };

  return componentJson;
};
