import dedent from 'dedent';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getProps } from '../helpers/get-props';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { babelTransformCode } from '../helpers/babel-transform';

import { pipe } from 'fp-ts/lib/function';
export interface ToSvelteOptions extends BaseTranspilerOptions {
  stateType?: 'proxies' | 'variables';
}

const mappers: {
  [key: string]: (json: MitosisNode, options: ToSvelteOptions) => string;
} = {
  Fragment: (json, options) => {
    if (json.bindings.innerHTML) {
      return BINDINGS_MAPPER.innerHTML(json, options);
    } else if (json.children.length > 0) {
      return `${json.children
        .map((item) => blockToSvelte(item, options))
        .join('\n')}`;
    } else {
      return '';
    }
  },
};

const BINDINGS_MAPPER = {
  innerHTML: (json: MitosisNode, options: ToSvelteOptions) =>
    `{@html ${stripStateAndPropsRefs(json.bindings.innerHTML)}}`,
};

export const blockToSvelte = (
  json: MitosisNode,
  options: ToSvelteOptions,
): string => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text) {
    return `{${stripStateAndPropsRefs(json.bindings._text as string, {
      includeState: options.stateType === 'variables',
    })}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `{#each ${stripStateAndPropsRefs(json.bindings.each as string, {
      includeState: options.stateType === 'variables',
    })} as ${json.properties._forName}, index }`;
    str += json.children.map((item) => blockToSvelte(item, options)).join('\n');
    str += `{/each}`;
  } else if (json.name === 'Show') {
    str += `{#if ${stripStateAndPropsRefs(json.bindings.when as string, {
      includeState: options.stateType === 'variables',
    })} }`;
    str += json.children.map((item) => blockToSvelte(item, options)).join('\n');
    str += `{/if}`;
  } else {
    str += `<${json.name} `;

    if (json.bindings._spread) {
      str += `{...${stripStateAndPropsRefs(json.bindings._spread as string, {
        includeState: options.stateType === 'variables',
      })}}`;
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
      const value = json.bindings[key] as string;
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(value, {
        includeState: options.stateType === 'variables',
      });

      if (key.startsWith('on')) {
        const event = key.replace('on', '').toLowerCase();
        // TODO: handle quotes in event handler values
        str += ` on:${event}="{event => ${removeSurroundingBlock(useValue)}}" `;
      } else if (key === 'ref') {
        str += ` bind:this={${useValue}} `;
      } else {
        str += ` ${key}={${useValue}} `;
      }
    }
    // if we have innerHTML, it doesn't matter whether we have closing tags or not, or children or not.
    // we use the innerHTML content as children and don't render the self-closing tag.
    if (json.bindings.innerHTML) {
      str += '>';
      str += BINDINGS_MAPPER.innerHTML(json, options);
      str += `</${json.name}>`;
      return str;
    }

    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) => blockToSvelte(item, options))
        .join('\n');
    }

    str += `</${json.name}>`;
  }
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
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const { value, onChange } = item.bindings;
      if (value && onChange) {
        if (
          (onChange as string).replace(/\s+/g, '') ===
          `${value}=event.target.value`
        ) {
          delete item.bindings.value;
          delete item.bindings.onChange;
          item.bindings['bind:value'] = value;
        }
      }
    }
  });
};

export const componentToSvelte =
  (options: ToSvelteOptions = {}): Transpiler =>
  ({ component }) => {
    const useOptions: ToSvelteOptions = {
      ...options,
      stateType: 'variables',
    };
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    if (useOptions.plugins) {
      json = runPreJsonPlugins(json, useOptions.plugins);
    }

    const refs = Array.from(getRefs(json));
    useBindValue(json, useOptions);

    gettersToFunctions(json);

    if (useOptions.plugins) {
      json = runPostJsonPlugins(json, useOptions.plugins);
    }
    const css = collectCss(json);
    stripMetaProperties(json);

    const dataString = pipe(
      getStateObjectStringFromComponent(json, {
        data: true,
        functions: false,
        getters: false,
        format: useOptions.stateType === 'proxies' ? 'object' : 'variables',
        keyPrefix: useOptions.stateType === 'variables' ? 'let ' : '',
        valueMapper: (code) =>
          stripStateAndPropsRefs(code, {
            includeState: useOptions.stateType === 'variables',
          }),
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
          stripStateAndPropsRefs(
            code
              .replace(/^get ([a-zA-Z_\$0-9]+)/, '$1 = ')
              .replace(/\)/, ') => '),
            {
              includeState: useOptions.stateType === 'variables',
            },
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
        keyPrefix: 'function ',
        valueMapper: (code) =>
          stripStateAndPropsRefs(code, {
            includeState: useOptions.stateType === 'variables',
          }),
      }),
      babelTransformCode,
    );

    const hasData = dataString.length > 4;

    const props = Array.from(getProps(json));

    let str = dedent`
    <script>
      ${!json.hooks.onMount?.code ? '' : `import { onMount } from 'svelte'`}
      ${
        !json.hooks.onUpdate?.length
          ? ''
          : `import { afterUpdate } from 'svelte'`
      }
      ${!json.hooks.onUnMount?.code ? '' : `import { onDestroy } from 'svelte'`}
      ${renderPreComponent(json, 'svelte')}

      ${
        !hasData || useOptions.stateType === 'variables'
          ? ''
          : `import onChange from 'on-change'`
      }
      ${refs
        .concat(props)
        .map((name) => `export let ${name};`)
        .join('\n')}

      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}

      ${
        useOptions.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }

      ${
        !json.hooks.onMount?.code
          ? ''
          : `onMount(() => { ${stripStateAndPropsRefs(json.hooks.onMount.code, {
              includeState: useOptions.stateType === 'variables',
            })} });`
      }

      ${
        !json.hooks.onUpdate?.length
          ? ''
          : json.hooks.onUpdate
              .map(
                (hook) =>
                  `afterUpdate(() => { ${stripStateAndPropsRefs(hook.code, {
                    includeState: useOptions.stateType === 'variables',
                  })} })`,
              )
              .join(';')
      }

      ${
        !json.hooks.onUnMount?.code
          ? ''
          : `onDestroy(() => { ${stripStateAndPropsRefs(
              json.hooks.onUnMount.code,
              {
                includeState: useOptions.stateType === 'variables',
              },
            )} });`
      }
    </script>

    ${json.children.map((item) => blockToSvelte(item, useOptions)).join('\n')}

    ${
      !css.trim().length
        ? ''
        : `<style>
      ${css}
    </style>`
    }
  `;

    if (useOptions.plugins) {
      str = runPreCodePlugins(str, useOptions.plugins);
    }
    if (useOptions.prettier !== false) {
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
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    if (useOptions.plugins) {
      str = runPostCodePlugins(str, useOptions.plugins);
    }
    return str;
  };
