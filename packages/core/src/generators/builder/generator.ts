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
import { Binding, ForNode, MitosisNode } from '@/types/mitosis-node';
import { MitosisStyles } from '@/types/mitosis-styles';
import { TranspilerArgs } from '@/types/transpiler';
import { traverse as babelTraverse, types } from '@babel/core';
import generate from '@babel/generator';
import { parseExpression } from '@babel/parser';
import type { Node } from '@babel/types';
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
      width: item.component?.options?.width,
    }));

    block.component!.options.columns = columns;

    block.children = [];

    return block;
  },
  Fragment(node, options) {
    const block = blockToBuilder(node, options, { skipMapper: true });
    block.component = { name: 'Core:Fragment' };
    block.tagName = undefined;
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
                  if (path.scope.hasBinding(target)) return;

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

const processLocalizedValues = (element: BuilderElement, node: MitosisNode) => {
  if (node.localizedValues) {
    for (const [path, value] of Object.entries(node.localizedValues)) {
      set(element, path, value);
    }
  }
  return element;
};

/**
 * Turns a stringified object into an object that can be looped over.
 * Since values in the stringified object could be JS expressions, all
 * values in the resulting object will remain strings.
 * @param input - The stringified object
 */
const parseJSObject = (
  input: string,
): {
  parsed: Record<string, string>;
  unparsed?: string;
} => {
  const unparsed: string[] = [];
  let parsed: Record<string, string> = {};

  try {
    const ast = parseExpression(`(${input})`, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
    });

    if (ast.type !== 'ObjectExpression') {
      return { parsed, unparsed: input };
    }

    for (const prop of ast.properties) {
      /**
       * If the object includes spread or method, we stop. We can't really break the component into Key/Value
       * and the whole expression is considered dynamic. We return `false` to signify that.
       */
      if (prop.type === 'ObjectMethod' || prop.type === 'SpreadElement') {
        if (!!prop.start && !!prop.end) {
          if (typeof input === 'string') {
            unparsed.push(input.slice(prop.start - 1, prop.end - 1));
          }
        }
        continue;
      }

      /**
       * Ignore shorthand objects when processing incomplete objects. Otherwise we may
       * create identifiers unintentionally.
       * Example: When accounting for shorthand objects, "{ color" would become
       * { color: color } thus creating a "color" identifier that does not exist.
       */
      if (prop.type === 'ObjectProperty') {
        if (prop.extra?.shorthand) {
          if (typeof input === 'string') {
            unparsed.push(input.slice(prop.start! - 1, prop.end! - 1));
          }
          continue;
        }

        let key = '';
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'StringLiteral') {
          key = prop.key.value;
        } else {
          continue;
        }

        if (typeof input === 'string') {
          const [val, err] = extractValue(input, prop.value);
          if (err === null) {
            parsed[key] = val;
          }
        }
      }
    }

    return {
      parsed,
      unparsed: unparsed.length > 0 ? `{${unparsed.join('\n')}}` : undefined,
    };
  } catch (err) {
    return {
      parsed,
      unparsed: unparsed.length > 0 ? `{${unparsed.join('\n')}}` : undefined,
    };
  }
};

const extractValue = (input: string, node: Node | null): [string, null] | [null, string] => {
  const start = node?.loc?.start;
  const end = node?.loc?.end;
  const startIndex =
    start !== undefined && 'index' in start && typeof start['index'] === 'number'
      ? start['index']
      : undefined;
  const endIndex =
    end !== undefined && 'index' in end && typeof end['index'] === 'number'
      ? end['index']
      : undefined;

  if (startIndex === undefined || endIndex === undefined || node === null) {
    const err = `bad value: ${node}`;
    return [null, err];
  }

  const value = input.slice(startIndex - 1, endIndex - 1);
  return [value, null];
};

/**
 * Maps and styles that are bound with dynamic values onto their respective
 * binding keys for Builder elements. This function also maps media queries
 * with dynamic values.
 * @param - bindings - The bindings object that has your styles. This param
 * will be modified in-place, and the old "style" key will be removed.
 */
const mapBoundStyles = (bindings: { [key: string]: Binding | undefined }) => {
  const styles = bindings['style'];
  if (!styles) {
    return;
  }
  const { parsed, unparsed } = parseJSObject(styles.code);

  for (const key in parsed) {
    const mediaQueryMatch = key.match(mediaQueryRegex);

    if (mediaQueryMatch) {
      const { parsed: mParsed } = parseJSObject(parsed[key]);
      const [_, pixelSize] = mediaQueryMatch;
      const size = sizes.getSizeForWidth(Number(pixelSize));
      for (const mKey in mParsed) {
        bindings[`responsiveStyles.${size}.${mKey}`] = {
          code: mParsed[mKey],
          bindingType: 'expression',
          type: 'single',
        };
      }
    } else {
      if (isGlobalStyle(key)) {
        console.warn(
          `The following bound styles are not supported by Builder JSON and have been removed:
  "${key}": ${parsed[key]}
          `,
        );
      } else {
        bindings[`style.${key}`] = {
          code: parsed[key],
          bindingType: 'expression',
          type: 'single',
        };
      }
    }
  }

  delete bindings['style'];

  // unparsed data could be something else such as a function call
  if (unparsed) {
    try {
      const ast = parseExpression(`(${unparsed})`, {
        plugins: ['jsx', 'typescript'],
        sourceType: 'module',
      });

      // style={state.getStyles()}
      if (ast.type === 'CallExpression') {
        bindings['style'] = {
          code: unparsed,
          bindingType: 'expression',
          type: 'single',
        };
      } else {
        throw 'unsupported style';
      }
    } catch {
      console.warn(`The following bound styles are invalid and have been removed: ${unparsed}`);
    }
  }
};

function isGlobalStyle(key: string) {
  // These are mapped to their respective responsiveStyle and support bindings
  if (/max-width: (.*?)px/gm.exec(key)) {
    return false;
  }

  return (
    // pseudo class
    key.startsWith('&:') ||
    key.startsWith(':') ||
    // @ rules
    key.startsWith('@')
  );
}

export const blockToBuilder = (
  json: MitosisNode,
  options: ToBuilderOptions = {},
  _internalOptions: InternalOptions = {},
): BuilderElement => {
  const mapper = !_internalOptions.skipMapper && componentMappers[json.name];

  if (mapper) {
    const element = mapper(json, options);
    return processLocalizedValues(element, json);
  }
  if (json.properties._text || json.bindings._text?.code) {
    const element = el(
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
    return processLocalizedValues(element, json);
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

    if (key === 'style') {
      mapBoundStyles(bindings);
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

  for (const key in json.blocksSlots) {
    const value = json.blocksSlots[key];
    traverse(value).forEach(function (v) {
      if (isMitosisNode(v)) {
        this.update(blockToBuilder(v, options, _internalOptions));
      }
    });
    componentOptions[key] = value;
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

  const element = el(
    {
      tagName: thisIsComponent ? undefined : json.name,
      ...(hasCss && {
        responsiveStyles,
      }),
      layerName: json.properties.$name,
      ...(json.properties['data-builder-layerLocked'] !== undefined && {
        layerLocked: json.properties['data-builder-layerLocked'] === 'true',
      }),
      ...(json.properties['data-builder-groupLocked'] !== undefined && {
        groupLocked: json.properties['data-builder-groupLocked'] === 'true',
      }),
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

  return processLocalizedValues(element, json);
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
