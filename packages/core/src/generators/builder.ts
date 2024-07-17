import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { attempt, mapValues, omit, omitBy, set } from 'lodash';
import traverse from 'neotraverse/legacy';
import { format } from 'prettier/standalone';
import { mediaQueryRegex, sizes } from '../constants/media-sizes';
import { dedent } from '../helpers/dedent';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { hasProps } from '../helpers/has-props';
import { isComponent } from '../helpers/is-component';
import { isUpperCase } from '../helpers/is-upper-case';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { checkHasState } from '../helpers/state';
import { isBuilderElement, symbolBlocksAsChildren } from '../parsers/builder';
import { hashCodeAsString } from '../symbols/symbol-processor';
import { ForNode, MitosisNode } from '../types/mitosis-node';
import { MitosisStyles } from '../types/mitosis-styles';
import { BaseTranspilerOptions, TranspilerArgs } from '../types/transpiler';
import { stringifySingleScopeOnMount } from './helpers/on-mount';

export interface ToBuilderOptions extends BaseTranspilerOptions {
  includeIds?: boolean;
}

const omitMetaProperties = (obj: Record<string, any>) =>
  omitBy(obj, (_value, key) => key.startsWith('$'));

const builderBlockPrefixes = ['Amp', 'Core', 'Builder', 'Raw', 'Form'];
const mapComponentName = (name: string) => {
  if (name === 'CustomCode') {
    return 'Custom Code';
  }
  for (const prefix of builderBlockPrefixes) {
    if (name.startsWith(prefix)) {
      const suffix = name.replace(prefix, '');
      if (isUpperCase(suffix[0])) {
        return `${prefix}:${name.replace(prefix, '')}`;
      }
    }
  }
  return name;
};

const componentMappers: {
  [key: string]: (node: MitosisNode, options: ToBuilderOptions) => BuilderElement;
} = {
  // TODO: add back if this direction (blocks as children not prop) is desired
  ...(!symbolBlocksAsChildren
    ? {}
    : {
        Symbol(node, options) {
          const child = node.children[0];
          const symbolOptions =
            (node.bindings.symbol && json5.parse(node.bindings.symbol.code)) || {};

          if (child) {
            set(
              symbolOptions,
              'content.data.blocks',
              child.children.map((item) => blockToBuilder(item, options)),
            );
          }

          return el(
            {
              component: {
                name: 'Symbol',
                options: {
                  // TODO: forward other symbol options
                  symbol: symbolOptions,
                },
              },
            },
            options,
          );
        },
      }),
  Columns(node, options) {
    const block = blockToBuilder(node, options, { skipMapper: true });

    const columns = block.children!.map((item) => ({
      blocks: item.children,
    }));

    block.component!.options.columns = columns;

    block.children = [];

    return block;
  },
  For(_node, options) {
    const node = _node as any as ForNode;
    return el(
      {
        component: {
          name: 'Core:Fragment',
        },
        repeat: {
          collection: node.bindings.each?.code as string,
          itemName: node.scope.forName,
        },
        children: node.children
          .filter(filterEmptyTextNodes)
          .map((node) => blockToBuilder(node, options)),
      },
      options,
    );
  },
  Show(node, options) {
    return el(
      {
        // TODO: the reverse mapping for this
        component: {
          name: 'Core:Fragment',
        },
        bindings: {
          show: node.bindings.when?.code as string,
        },
        children: node.children
          .filter(filterEmptyTextNodes)
          .map((node) => blockToBuilder(node, options)),
      },
      options,
    );
  },
};

const el = (
  options: Partial<BuilderElement>,
  toBuilderOptions: ToBuilderOptions,
): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  ...(toBuilderOptions.includeIds && {
    id: 'builder-' + hashCodeAsString(options),
  }),
  ...options,
});

function tryFormat(code: string) {
  let str = code;
  try {
    str = format(str, {
      parser: 'babel',
      plugins: [
        require('prettier/parser-babel'), // To support running in browsers
      ],
    });
  } catch (err) {
    console.error('Format error for code:', str);
    throw err;
  }
  return str;
}

type InternalOptions = {
  skipMapper?: boolean;
};

export const blockToBuilder = (
  json: MitosisNode,
  options: ToBuilderOptions = {},
  _internalOptions: InternalOptions = {},
): BuilderElement => {
  const mapper = !_internalOptions.skipMapper && componentMappers[json.name];
  if (mapper) {
    return mapper(json, options);
  }
  if (json.properties._text || json.bindings._text?.code) {
    return el(
      {
        tagName: 'span',
        bindings: {
          ...(json.bindings._text?.code
            ? {
                'component.options.text': json.bindings._text.code,
                'json.bindings._text.code': undefined as any,
              }
            : {}),
        },
        component: {
          name: 'Text',
          options: {
            text: json.properties._text,
          },
        },
      },
      options,
    );
  }

  const thisIsComponent = isComponent(json);

  let bindings = json.bindings;
  const actions: { [key: string]: string } = {};

  for (const key in bindings) {
    const eventBindingKeyRegex = /^on([A-Z])/;
    const firstCharMatchForEventBindingKey = key.match(eventBindingKeyRegex)?.[1];
    if (firstCharMatchForEventBindingKey) {
      actions[key.replace(eventBindingKeyRegex, firstCharMatchForEventBindingKey.toLowerCase())] =
        removeSurroundingBlock(bindings[key]?.code as string);
      delete bindings[key];
    }
  }

  const builderBindings: Record<string, string> = {};
  const componentOptions: Record<string, any> = omitMetaProperties(json.properties);

  if (thisIsComponent) {
    for (const key in bindings) {
      if (key === 'css') {
        continue;
      }
      const value = bindings[key];
      const parsed = attempt(() => json5.parse(value?.code as string));

      if (!(parsed instanceof Error)) {
        componentOptions[key] = parsed;
      } else {
        builderBindings[`component.options.${key}`] = bindings[key]!.code;
      }
    }
  }

  const hasCss = !!bindings.css?.code;

  let responsiveStyles: {
    large: MitosisStyles;
    medium?: MitosisStyles;
    small?: MitosisStyles;
  } = {
    large: {},
  };

  if (hasCss) {
    const cssRules = json5.parse(bindings.css?.code as string);
    const cssRuleKeys = Object.keys(cssRules);
    for (const ruleKey of cssRuleKeys) {
      const mediaQueryMatch = ruleKey.match(mediaQueryRegex);
      if (mediaQueryMatch) {
        const [fullmatch, pixelSize] = mediaQueryMatch;
        const sizeForWidth = sizes.getSizeForWidth(Number(pixelSize));
        const currentSizeStyles = responsiveStyles[sizeForWidth] || {};
        responsiveStyles[sizeForWidth] = {
          ...currentSizeStyles,
          ...cssRules[ruleKey],
        };
      } else {
        responsiveStyles.large = {
          ...responsiveStyles.large,
          [ruleKey]: cssRules[ruleKey],
        };
      }
    }

    delete json.bindings.css;
  }

  if (thisIsComponent) {
    for (const key in json.bindings) {
      builderBindings[`component.options.${key}`] = json.bindings[key]!.code;
    }
  }

  return el(
    {
      tagName: thisIsComponent ? undefined : json.name,
      ...(hasCss && {
        responsiveStyles,
      }),
      layerName: json.properties.$name,
      ...(thisIsComponent && {
        component: {
          name: mapComponentName(json.name),
          options: componentOptions,
        },
      }),
      code: {
        bindings: builderBindings,
        actions,
      },
      properties: thisIsComponent ? undefined : omitMetaProperties(json.properties),
      bindings: thisIsComponent
        ? builderBindings
        : omit(
            mapValues(bindings, (value) => value?.code!),
            'css',
          ),
      actions,
      children: json.children
        .filter(filterEmptyTextNodes)
        .map((child) => blockToBuilder(child, options)),
    },
    options,
  );
};

export const componentToBuilder =
  (options: ToBuilderOptions = {}) =>
  ({ component }: TranspilerArgs): BuilderContent => {
    const hasState = checkHasState(component);

    const result: BuilderContent = fastClone({
      data: {
        httpRequests: component?.meta?.useMetadata?.httpRequests,
        jsCode: tryFormat(dedent`
        ${!hasProps(component) ? '' : `var props = state;`}

        ${!hasState ? '' : `Object.assign(state, ${getStateObjectStringFromComponent(component)});`}
        
        ${stringifySingleScopeOnMount(component)}
      `),
        tsCode: tryFormat(dedent`
        ${!hasProps(component) ? '' : `var props = state;`}

        ${!hasState ? '' : `useState(${getStateObjectStringFromComponent(component)});`}

        ${
          !component.hooks.onMount.length
            ? ''
            : `onMount(() => {
                ${stringifySingleScopeOnMount(component)}
              })`
        }
      `),
        blocks: component.children
          .filter(filterEmptyTextNodes)
          .map((child) => blockToBuilder(child, options)),
      },
    });

    const subComponentMap: Record<string, BuilderContent> = {};

    for (const subComponent of component.subComponents) {
      const name = subComponent.name;
      subComponentMap[name] = componentToBuilder(options)({
        component: subComponent,
      });
    }

    traverse([result, subComponentMap]).forEach(function (el) {
      if (isBuilderElement(el)) {
        const value = subComponentMap[el.component?.name!];
        if (value) {
          set(el, 'component.options.symbol.content', value);
        }
      }
    });

    return result;
  };
