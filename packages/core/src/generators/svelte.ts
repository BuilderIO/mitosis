import dedent from 'dedent';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getProps } from '../helpers/get-props';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';

export type ToSvelteOptions = {
  prettier?: boolean;
  stateType?: 'proxies' | 'variables';
  plugins?: Plugin[];
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToSvelteOptions) => string;
} = {
  Fragment: (json, options) => {
    return `${json.children
      .map((item) => blockToSvelte(item, options))
      .join('\n')}`;
  },
};

export const blockToSvelte = (json: JSXLiteNode, options: ToSvelteOptions) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
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
    })} as ${json.bindings._forName} }`;
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
        str += ` on:${event}="{event => ${useValue}}" `;
      } else if (key === 'ref') {
        str += ` bind:this={${useValue}} `;
      } else {
        str += ` ${key}={${useValue}} `;
      }
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
const useBindValue = (json: JSXLiteComponent, options: ToSvelteOptions) => {
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
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

export const componentToSvelte = (
  componentJson: JSXLiteComponent,
  options: ToSvelteOptions = {},
) => {
  // Make a copy we can safely mutate, similar to babel's toolchain
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }

  const refs = Array.from(getRefs(json));
  useBindValue(json, options);

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const css = collectCss(json);

  let dataString = getStateObjectString(json, {
    data: true,
    functions: false,
    getters: false,
    format: options.stateType === 'proxies' ? 'object' : 'variables',
    keyPrefix: options.stateType === 'variables' ? 'let ' : '',
    valueMapper: (code) =>
      stripStateAndPropsRefs(code, {
        includeState: options.stateType === 'variables',
      }),
  });

  const getterString = getStateObjectString(json, {
    data: false,
    getters: true,
    functions: false,
    format: 'variables',
    keyPrefix: '$: ',
    valueMapper: (code) =>
      stripStateAndPropsRefs(
        code.replace(/^get ([a-zA-Z_\$0-9]+)/, '$1 = ').replace(/\)/, ') => '),
        {
          includeState: options.stateType === 'variables',
        },
      ),
  });

  const functionsString = getStateObjectString(json, {
    data: false,
    getters: false,
    functions: true,
    format: 'variables',
    keyPrefix: 'function ',
    valueMapper: (code) =>
      stripStateAndPropsRefs(code, {
        includeState: options.stateType === 'variables',
      }),
  });

  const hasData = dataString.length > 4;

  const props = Array.from(getProps(json));

  let str = dedent`
    <script>
      ${renderPreComponent(json)}

      ${
        !hasData || options.stateType === 'variables'
          ? ''
          : `import onChange from 'on-change'`
      }
      ${refs
        .concat(props)
        .map((name) => `let ${name};`)
        .join('\n')}
      
      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}
      
      ${
        options.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }
    </script>

    ${json.children.map((item) => blockToSvelte(item, options)).join('\n')}

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
      console.warn('Could not prettify', { string: str }, err);
    }
  }
  if (options.plugins) {
    str = runPostCodePlugins(str, options.plugins);
  }
  return str;
};
