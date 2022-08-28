import dedent from 'dedent';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { collectCss } from '../helpers/styles/collect-css';
import { hasStyle } from '../helpers/styles/helpers';
import { fastClone } from '../helpers/fast-clone';
import { getProps } from '../helpers/get-props';
import { getRefs } from '../helpers/get-refs';
import {
  stringifyContextValue,
  getStateObjectStringFromComponent,
} from '../helpers/get-state-object-string';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, Transpiler } from '../types/transpiler';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { babelTransformCode } from '../helpers/babel-transform';
import { pipe } from 'fp-ts/lib/function';
import { hasContext } from './helpers/context';
import { VALID_HTML_TAGS } from '../constants/html_tags';
import { isUpperCase } from '../helpers/is-upper-case';
import json5 from 'json5';
import { propTypesToJson } from '../helpers/prop-types-to-json';
import { JSONObject } from '../types/json';

export interface ToSvelteOptions extends BaseTranspilerOptions {
  stateType?: 'proxies' | 'variables';
}

const mappers: {
  [key: string]: BlockToSvelte;
} = {
  Fragment: ({ json, options, parentComponent }) => {
    if (json.bindings.innerHTML?.code) {
      return BINDINGS_MAPPER.innerHTML(json, options);
    } else if (json.children.length > 0) {
      return `${json.children
        .map((item) => blockToSvelte({ json: item, options, parentComponent }))
        .join('\n')}`;
    } else {
      return '';
    }
  },
  For: ({ json, options, parentComponent }) => {
    const firstChild = json.children[0];
    const keyValue = firstChild.properties.key || firstChild.bindings.key?.code;

    if (keyValue) {
      // we remove extraneous prop which Svelte does not use
      delete firstChild.properties.key;
      delete firstChild.bindings.key;
    }

    return `
{#each ${stripStateAndProps(json.bindings.each?.code, options)} as ${json.scope.For[0]}${
      json.scope.For[1] ? `, ${json.scope.For[1]}` : ''
    } ${keyValue ? `(${keyValue})` : ''}}
${json.children.map((item) => blockToSvelte({ json: item, options, parentComponent })).join('\n')}
{/each}
`;
  },
  Show: ({ json, options, parentComponent }) => {
    return `
{#if ${stripStateAndProps(json.bindings.when?.code, options)} }
${json.children.map((item) => blockToSvelte({ json: item, options, parentComponent })).join('\n')}

  ${
    json.meta.else
      ? `
  {:else}
  ${blockToSvelte({
    json: json.meta.else as MitosisNode,
    options,
    parentComponent,
  })}
  `
      : ''
  }
{/if}`;
  },
};

const getContextCode = (json: MitosisComponent) => {
  const contextGetters = json.context.get;
  return Object.keys(contextGetters)
    .map((key) => `let ${key} = getContext(${contextGetters[key].name}.key);`)
    .join('\n');
};

const setContextCode = (json: MitosisComponent) => {
  const contextSetters = json.context.set;
  return Object.keys(contextSetters)
    .map((key) => {
      const { value, name } = contextSetters[key];
      return `setContext(${name}.key, ${
        value ? stripStateAndPropsRefs(stringifyContextValue(value)) : 'undefined'
      });`;
    })
    .join('\n');
};

const BINDINGS_MAPPER = {
  innerHTML: (json: MitosisNode, options: ToSvelteOptions) =>
    `{@html ${stripStateAndPropsRefs(json.bindings.innerHTML?.code)}}`,
};

interface BlockToSvelteProps {
  json: MitosisNode;
  options: ToSvelteOptions;
  parentComponent: MitosisComponent;
}

const SVELTE_SPECIAL_TAGS = {
  COMPONENT: 'svelte:component',
  ELEMENT: 'svelte:element',
  SELF: 'svelte:self',
} as const;

const getTagName = ({
  json,
  parentComponent,
}: {
  json: MitosisNode;
  parentComponent: MitosisComponent;
}) => {
  if (parentComponent && json.name === parentComponent.name) {
    return SVELTE_SPECIAL_TAGS.SELF;
  }

  const isValidHtmlTag = VALID_HTML_TAGS.includes(json.name);
  const isSpecialSvelteTag = json.name.startsWith('svelte:');
  // Check if any import matches `json.name`
  const hasMatchingImport = parentComponent.imports.some(({ imports }) =>
    Object.keys(imports).some((name) => name === json.name),
  );
  // TO-DO: no way to decide between <svelte:component> and <svelte:element>...need to do that through metadata
  // overrides for now
  if (!isValidHtmlTag && !isSpecialSvelteTag && !hasMatchingImport) {
    json.bindings.this = { code: json.name };
    return SVELTE_SPECIAL_TAGS.COMPONENT;
  }

  return json.name;
};

type BlockToSvelte = (props: BlockToSvelteProps) => string;

const stripStateAndProps = (code: string | undefined, options: ToSvelteOptions) =>
  stripStateAndPropsRefs(code, {
    includeState: options.stateType === 'variables',
  });

export const blockToSvelte: BlockToSvelte = ({ json, options, parentComponent }) => {
  if (mappers[json.name]) {
    return mappers[json.name]({ json, options, parentComponent });
  }

  const tagName = getTagName({ json, parentComponent });

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text?.code) {
    return `{${stripStateAndProps(json.bindings._text.code, options)}}`;
  }

  let str = '';

  str += `<${tagName} `;

  if (json.bindings._spread?.code) {
    str += `{...${stripStateAndProps(json.bindings._spread.code, options)}}`;
  }

  const isComponent = Boolean(tagName[0] && isUpperCase(tagName[0]));
  if ((json.bindings.style?.code || json.properties.style) && !isComponent) {
    const useValue = stripStateAndProps(
      json.bindings.style?.code || json.properties.style,
      options,
    );

    str += `use:mitosis_styling={${useValue}}`;
    delete json.bindings.style;
    delete json.properties.style;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    if (key === 'innerHTML') {
      continue;
    }
    if (key === '_spread') {
      continue;
    }
    const { code: value, arguments: cusArgs = ['event'] } = json.bindings[key]!;
    // TODO: proper babel transform to replace. Util for this
    const useValue = stripStateAndProps(value, options);

    if (key.startsWith('on')) {
      const event = key.replace('on', '').toLowerCase();
      // TODO: handle quotes in event handler values

      const valueWithoutBlock = removeSurroundingBlock(useValue);

      if (valueWithoutBlock === key) {
        str += ` on:${event}={${valueWithoutBlock}} `;
      } else {
        str += ` on:${event}="{${cusArgs.join(',')} => {${valueWithoutBlock}}}" `;
      }
    } else if (key === 'ref') {
      str += ` bind:this={${useValue}} `;
    } else {
      str += ` ${key}={${useValue}} `;
    }
  }
  // if we have innerHTML, it doesn't matter whether we have closing tags or not, or children or not.
  // we use the innerHTML content as children and don't render the self-closing tag.
  if (json.bindings.innerHTML?.code) {
    str += '>';
    str += BINDINGS_MAPPER.innerHTML(json, options);
    str += `</${tagName}>`;
    return str;
  }

  if (selfClosingTags.has(tagName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToSvelte({ json: item, options, parentComponent }))
      .join('');
  }

  str += `</${tagName}>`;

  return str;
};

/**
 * Replace
 *    <input value={state.name} onChange={event => state.name = event.target.value}
 * with
 *    <input bind:value={state.name}/>
 * when easily identified, for more idiomatic svelte code
 */
const useBindValue = (json: MitosisComponent, options: ToSvelteOptions) => {
  function normalizeStr(str: string) {
    return str
      .trim()
      .replace(/\n|\r/g, '')
      .replace(/^{/, '')
      .replace(/}$/, '')
      .replace(/;$/, '')
      .replace(/\s+/g, '');
  }
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const { value, onChange } = item.bindings;
      if (value && onChange) {
        const { arguments: cusArgs = ['event'] } = onChange;
        if (
          normalizeStr(onChange.code) === `${normalizeStr(value.code)}=${cusArgs[0]}.target.value`
        ) {
          delete item.bindings.value;
          delete item.bindings.onChange;
          item.bindings['bind:value'] = value;
        }
      }
    }
  });
};
/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string) => {
  return str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');
};

const FUNCTION_HACK_PLUGIN: Plugin = () => ({
  json: {
    pre: (json) => {
      for (const key in json.state) {
        const value = json.state[key]?.code;
        const type = json.state[key]?.type;
        if (typeof value === 'string' && type === 'method') {
          const newValue = `function ${value}`;
          json.state[key] = {
            code: newValue,
            type: 'method',
          };
        } else if (typeof value === 'string' && type === 'function') {
          json.state[key] = {
            code: value,
            type: 'method',
          };
        }
      }
    },
  },
});

export const componentToSvelte =
  ({ plugins = [], ...userProvidedOptions }: ToSvelteOptions = {}): Transpiler =>
  ({ component }) => {
    const options: ToSvelteOptions = {
      stateType: 'variables',
      prettier: true,
      plugins: [FUNCTION_HACK_PLUGIN, ...plugins],
      ...userProvidedOptions,
    };
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }

    const refs = Array.from(getRefs(json));
    useBindValue(json, options);

    gettersToFunctions(json);

    if (options.plugins) {
      json = runPostJsonPlugins(json, options.plugins);
    }
    const css = collectCss(json);
    stripMetaProperties(json);

    const dataString = pipe(
      getStateObjectStringFromComponent(json, {
        data: true,
        functions: false,
        getters: false,
        format: options.stateType === 'proxies' ? 'object' : 'variables',
        keyPrefix: options.stateType === 'variables' ? 'let ' : '',
        valueMapper: (code) => stripStateAndProps(code, options),
      }),
      babelTransformCode,
    );

    const getterString = pipe(
      getStateObjectStringFromComponent(json, {
        data: false,
        getters: true,
        functions: false,
        format: 'variables',
        keyPrefix: '$: ',
        valueMapper: (code) =>
          pipe(
            code.replace(/^get ([a-zA-Z_\$0-9]+)/, '$1 = ').replace(/\)/, ') => '),
            (str) => stripStateAndProps(str, options),
            stripThisRefs,
          ),
      }),
      babelTransformCode,
    );

    const functionsString = pipe(
      getStateObjectStringFromComponent(json, {
        data: false,
        getters: false,
        functions: true,
        format: 'variables',
        valueMapper: (code) => pipe(stripStateAndProps(code, options), stripThisRefs),
      }),
      babelTransformCode,
    );

    const hasData = dataString.length > 4;

    const props = Array.from(getProps(json));

    const transformHookCode = (hookCode: string) =>
      pipe(stripStateAndProps(hookCode, options), babelTransformCode);

    let str = '';

    const jsonTypes: JSONObject = propTypesToJson(props, json);

    if (json.types?.length) {
      str += dedent`
      <script context='module' lang='ts'>
        ${json.types?.length ? json.types.join('\n\n') + '\n' : ''}
      </script>
      \n
      \n
      `;
    }

    // prepare svelte imports
    let svelteImports: string[] = [];

    if (json.hooks.onMount?.code?.length) {
      svelteImports.push('onMount');
    }
    if (json.hooks.onUpdate?.length) {
      svelteImports.push('afterUpdate');
    }
    if (json.hooks.onUnMount?.code?.length) {
      svelteImports.push('onDestroy');
    }
    if (hasContext(component)) {
      svelteImports.push('getContext', 'setContext');
    }

    str += dedent`
      <script lang='ts'>
      ${!svelteImports.length ? '' : `import { ${svelteImports.sort().join(', ')} } from 'svelte'`}
      ${renderPreComponent({ component: json, target: 'svelte' })}

      ${!hasData || options.stateType === 'variables' ? '' : `import onChange from 'on-change'`}
      ${props
        .map((name) => {
          if (name === 'children') {
            return '';
          }

          let propDeclaration = `export let ${name}`;

          if (Object.keys(jsonTypes).length) {
            propDeclaration += `: ${jsonTypes[name] ?? 'any'}`;
          }

          if (json.defaultProps && json.defaultProps.hasOwnProperty(name)) {
            propDeclaration += `=${json5.stringify(json.defaultProps[name])}`;
          }

          propDeclaration += ';';

          return propDeclaration;
        })
        .join('\n')}
      ${
        hasStyle(json)
          ? `
        function mitosis_styling (node, vars) {
          Object.entries(vars).forEach(([ p, v ]) => { node.style[p] = v })
        }
      `
          : ''
      }
      ${getContextCode(json)}
      ${setContextCode(json)}

      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}

      ${refs.map((ref) => `let ${stripStateAndPropsRefs(ref)}`).join('\n')}

      ${
        options.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }

      ${
        !json.hooks.onMount?.code
          ? ''
          : `onMount(() => { ${transformHookCode(json.hooks.onMount.code)} });`
      }

      ${
        !json.hooks.onUpdate?.length
          ? ''
          : json.hooks.onUpdate
              .map(({ code, deps }, index) => {
                const hookCode = transformHookCode(code);

                if (deps) {
                  const fnName = `onUpdateFn_${index}`;
                  return `
                    function ${fnName}() {
                      ${hookCode}
                    }
                    $: ${fnName}(...${stripStateAndProps(deps, options)})
                    `;
                } else {
                  return `afterUpdate(() => { ${hookCode} })`;
                }
              })
              .join(';')
      }

      ${
        !json.hooks.onUnMount?.code
          ? ''
          : `onDestroy(() => { ${transformHookCode(json.hooks.onUnMount.code)} });`
      }
    </script>

    ${json.children
      .map((item) =>
        blockToSvelte({
          json: item,
          options: options,
          parentComponent: json,
        }),
      )
      .join('\n')}

    ${
      !css.trim().length
        ? ''
        : `<style>
      ${css}
    </style>`
    }
  `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'svelte',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
            require('prettier/parser-typescript'),
            require('prettier-plugin-svelte'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify');
        console.warn({ string: str }, err);
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };
