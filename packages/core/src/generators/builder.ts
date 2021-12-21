import { MitosisNode } from '../types/mitosis-node';
import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { fastClone } from '../helpers/fast-clone';
import dedent from 'dedent';
import { format } from 'prettier/standalone';
import json5 from 'json5';
import { isUpperCase } from '../helpers/is-upper-case';
import { mediaQueryRegex, sizes } from '../constants/media-sizes';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { isComponent } from '../helpers/is-component';
import { hasProps } from '../helpers/has-props';
import { attempt, omit, omitBy, set } from 'lodash';
import { isBuilderElement, symbolBlocksAsChildren } from '../parsers/builder';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import traverse from 'traverse';
import { TranspilerArgs } from '../types/config';

export interface ToBuilderOptions {
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
  [key: string]: (
    node: MitosisNode,
    options: ToBuilderOptions,
  ) => BuilderElement;
} = {
  // TODO: add back if this direction (blocks as children not prop) is desired
  ...(!symbolBlocksAsChildren
    ? {}
    : {
        Symbol(node, options) {
          const child = node.children[0];
          const symbolOptions =
            (node.bindings.symbol &&
              json5.parse(node.bindings.symbol as string)) ||
            {};

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
  For(node, options) {
    return el(
      {
        component: {
          name: 'Core:Fragment',
        },
        repeat: {
          collection: node.bindings.each as string,
          itemName: node.properties._forName as string,
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
          show: node.bindings.when as string,
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
    id:
      'builder-' +
      Math.random()
        .toString(36)
        .split('.')[1],
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
  if (json.properties._text || json.bindings._text) {
    return el(
      {
        tagName: 'span',
        bindings: {
          ...(json.bindings._text
            ? {
                'component.options.text': json.bindings._text as string,
                'json.bindings._text': undefined as any,
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
    const firstCharMatchForEventBindingKey = key.match(
      eventBindingKeyRegex,
    )?.[1];
    if (firstCharMatchForEventBindingKey) {
      actions[
        key.replace(
          eventBindingKeyRegex,
          firstCharMatchForEventBindingKey.toLowerCase(),
        )
      ] = removeSurroundingBlock(bindings[key] as string) as string;
      delete bindings[key];
    }
  }

  const builderBindings: Record<string, any> = {};
  const componentOptions: Record<string, any> = omitMetaProperties(
    json.properties,
  );

  if (thisIsComponent) {
    for (const key in bindings) {
      if (key === 'css') {
        continue;
      }
      const value = bindings[key];
      const parsed = attempt(() => json5.parse(value as string));

      if (!(parsed instanceof Error)) {
        componentOptions[key] = parsed;
      } else {
        builderBindings[`component.options.${key}`] = bindings[key];
      }
    }
  }

  const hasCss = !!bindings.css;

  let responsiveStyles: {
    large: Partial<CSSStyleDeclaration>;
    medium?: Partial<CSSStyleDeclaration>;
    small?: Partial<CSSStyleDeclaration>;
  } = {
    large: {},
  };

  if (hasCss) {
    const cssRules = json5.parse(bindings.css as string);
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
      bindings[`component.options.${key}`] = json.bindings[key];
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
      properties: thisIsComponent
        ? undefined
        : omitMetaProperties(json.properties as any),
      bindings: thisIsComponent
        ? builderBindings
        : omit(bindings as any, 'css'),
      actions,
      children: json.children
        .filter(filterEmptyTextNodes)
        .map((child) => blockToBuilder(child, options)),
    },
    options,
  );
};

export const componentToBuilder = (options: ToBuilderOptions = {}) => ({
  component,
}: TranspilerArgs) => {
  const hasState = Boolean(Object.keys(component.state).length);

  const result = fastClone({
    data: {
      httpRequests: (component?.meta?.useMetadata as any)?.httpRequests,
      jsCode: tryFormat(dedent`
        ${!hasProps(component) ? '' : `var props = state;`}

        ${
          !hasState
            ? ''
            : `Object.assign(state, ${getStateObjectStringFromComponent(
                component,
              )});`
        }

        ${!component.hooks.onMount ? '' : component.hooks.onMount}
      `),
      tsCode: tryFormat(dedent`
        ${!hasProps(component) ? '' : `var props = state;`}

        ${
          !hasState
            ? ''
            : `useState(${getStateObjectStringFromComponent(component)});`
        }

        ${
          !component.hooks.onMount
            ? ''
            : `onMount(() => {
                ${component.hooks.onMount}
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

  traverse([result, subComponentMap]).forEach(function(el) {
    if (isBuilderElement(el)) {
      const value = subComponentMap[el.component?.name!];
      if (value) {
        console.log('applied?');
        set(el, 'component.options.symbol.content', value);
      }
    }
  });

  return result;
};
