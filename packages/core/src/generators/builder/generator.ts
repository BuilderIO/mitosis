import { mediaQueryRegex, sizes } from '@/constants/media-sizes';
import { ToBuilderOptions } from '@/generators/builder/types';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { filterEmptyTextNodes } from '@/helpers/filter-empty-text-nodes';
import { getStateObjectStringFromComponent } from '@/helpers/get-state-object-string';
import { hasProps } from '@/helpers/has-props';
import { isComponent } from '@/helpers/is-component';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { isUpperCase } from '@/helpers/is-upper-case';
import { parseCodeToAst } from '@/helpers/parsers';
import { removeSurroundingBlock } from '@/helpers/remove-surrounding-block';
import { replaceNodes } from '@/helpers/replace-identifiers';
import { checkHasState } from '@/helpers/state';
import { isBuilderElement, symbolBlocksAsChildren } from '@/parsers/builder';
import { hashCodeAsString } from '@/symbols/symbol-processor';
import { ForNode, MitosisNode } from '@/types/mitosis-node';
import { MitosisStyles } from '@/types/mitosis-styles';
import { TranspilerArgs } from '@/types/transpiler';
import { traverse as babelTraverse, types } from '@babel/core';
import generate from '@babel/generator';
import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { attempt, mapValues, omit, omitBy, set } from 'lodash';
import traverse from 'neotraverse/legacy';
import { format } from 'prettier/standalone';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';

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
      const restOfName = suffix[0];
      if (restOfName && isUpperCase(restOfName)) {
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
  PersonalizationContainer(node, options) {
    const block = blockToBuilder(node, options, { skipMapper: true });
    const variants: any[] = [];
    let defaultVariant: BuilderElement[] = [];
    const validFakeNodeNames = [
      'Variant',
      'PersonalizationOption',
      'PersonalizationVariant',
      'Personalization',
    ];
    block.children!.forEach((item) => {
      if (item.component && validFakeNodeNames.includes(item.component?.name)) {
        let query: any;
        if (item.component.options.query) {
          const optionsQuery = item.component.options.query;
          if (Array.isArray(optionsQuery)) {
            query = optionsQuery.map((q) => ({
              '@type': '@builder.io/core:Query',
              ...q,
            }));
          } else {
            query = [
              {
                '@type': '@builder.io/core:Query',
                ...optionsQuery,
              },
            ];
          }
          const newVariant = {
            ...item.component.options,
            query,
            blocks: item.children,
          };
          variants.push(newVariant);
        } else if (item.children) {
          defaultVariant.push(...item.children);
        }
      } else {
        defaultVariant.push(item);
      }
    });
    delete block.properties;
    delete block.bindings;

    block.component!.options.variants = variants;
    block.children = defaultVariant;

    return block;
  },
  For(_node, options) {
    const node = _node as any as ForNode;

    const replaceIndexNode = (str: string) =>
      replaceNodes({
        code: str,
        nodeMaps: [
          {
            from: types.identifier(target),
            to: types.memberExpression(types.identifier('state'), types.identifier('$index')),
          },
        ],
      });

    // rename `index` var to `state.$index`
    const target = node.scope.indexName || 'index';
    const replaceIndex = (node: MitosisNode) => {
      traverse(node).forEach(function (thing) {
        if (!isMitosisNode(thing)) return;
        for (const [key, value] of Object.entries(thing.bindings)) {
          if (!value) continue;
          if (!value.code.includes(target)) continue;

          if (value.type === 'single' && value.bindingType === 'function') {
            try {
              const code = value.code;

              const programNode = parseCodeToAst(code);

              if (!programNode) continue;

              babelTraverse(programNode, {
                Program(path) {
                  if (path.scope.hasBinding(target)) {
                    console.log('has binding');
                    return;
                  }
                  const x = {
                    id: types.identifier(target),
                    init: types.identifier('PLACEHOLDER'),
                  };
                  path.scope.push(x);
                  path.scope.rename(target, 'state.$index');
                  path.traverse({
                    VariableDeclaration(p) {
                      if (p.node.declarations.length === 1 && p.node.declarations[0].id === x.id) {
                        p.remove();
                      }
                    },
                  });
                },
              });

              thing.bindings[key]!.code = generate(programNode).code;
            } catch (error) {
              console.error(
                'Error processing function binding. Falling back to simple replacement.',
                error,
              );
              thing.bindings[key]!.code = replaceIndexNode(value.code);
            }
          } else {
            thing.bindings[key]!.code = replaceIndexNode(value.code);
          }
        }
      });
      return node;
    };

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
          .map((node) => blockToBuilder(replaceIndex(node), options)),
      },
      options,
    );
  },
  Show(node, options) {
    const elseCase = node.meta.else as MitosisNode;
    const children = node.children.filter(filterEmptyTextNodes);
    const showNode =
      children.length > 0
        ? el(
            {
              // TODO: the reverse mapping for this
              component: {
                name: 'Core:Fragment',
              },
              bindings: {
                show: node.bindings.when?.code as string,
              },
              children: children.map((node) => blockToBuilder(node, options)),
            },
            options,
          )
        : undefined;

    const elseNode =
      elseCase && filterEmptyTextNodes(elseCase)
        ? el(
            {
              // TODO: the reverse mapping for this
              component: {
                name: 'Core:Fragment',
              },
              bindings: {
                hide: node.bindings.when?.code as string,
              },
              children: [blockToBuilder(elseCase, options)],
            },
            options,
          )
        : undefined;

    if (elseNode && showNode) {
      return el(
        {
          component: {
            name: 'Core:Fragment',
          },
          children: [showNode, elseNode],
        },
        options,
      );
    } else if (showNode) {
      return showNode;
    } else if (elseNode) {
      return elseNode;
    }
    return el(
      {
        // TODO: the reverse mapping for this
        component: {
          name: 'Core:Fragment',
        },
        bindings: {
          show: node.bindings.when?.code as string,
        },
        children: [],
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
            // Mitosis uses {} for bindings, but Builder expects {{}} so we need to convert
            text: json.properties._text?.replace(/\{(.*?)\}/g, '{{$1}}'),
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
      let actionBody = bindings[key]?.async
        ? `(async () => ${bindings[key]?.code as string})()`
        : removeSurroundingBlock(bindings[key]?.code as string);

      const eventIdentifier = bindings[key]?.arguments?.[0];
      if (typeof eventIdentifier === 'string' && eventIdentifier !== 'event') {
        actionBody = replaceNodes({
          code: actionBody,
          nodeMaps: [{ from: types.identifier(eventIdentifier), to: types.identifier('event') }],
        });
      }
      actions[key.replace(eventBindingKeyRegex, firstCharMatchForEventBindingKey.toLowerCase())] =
        actionBody;
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
        if (!json.slots?.[key]) {
          builderBindings[`component.options.${key}`] = bindings[key]!.code;
        }
      }
    }
  }

  for (const key in json.slots) {
    componentOptions[key] = json.slots[key].map((node) => blockToBuilder(node, options));
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
      if (!json.slots?.[key]) {
        builderBindings[`component.options.${key}`] = json.bindings[key]!.code;
      }
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

        ${!hasState ? '' : `useStore(${getStateObjectStringFromComponent(component)});`}

        ${
          !component.hooks.onMount.length
            ? ''
            : `onMount(() => {
                ${stringifySingleScopeOnMount(component)}
              })`
        }
      `),
        cssCode: component?.style,
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
        if (el.bindings) {
          for (const [key, value] of Object.entries(el.bindings)) {
            if (value.match(/\n|;/)) {
              if (!el.code) {
                el.code = {};
              }
              if (!el.code.bindings) {
                el.code.bindings = {};
              }
              el.code.bindings[key] = value;
              el.bindings[key] = ` return ${value}`;
            }
          }
        }
      }
    });

    return result;
  };
