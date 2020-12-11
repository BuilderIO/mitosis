import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
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
import isChildren from '../helpers/is-children';

export type ToVueOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToVueOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<div>${json.children
      .map((item) => blockToVue(item, options))
      .join('\n')}</div>`;
  },
};

export const blockToVue = (
  json: JSXLiteNode,
  options: ToVueOptions = {},
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
    return `{${stripStateAndPropsRefs(json.bindings._text as string)}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `<template v-for="${
      json.bindings._forName
    } in ${stripStateAndPropsRefs(json.bindings.each as string)}">`;
    str += json.children.map((item) => blockToVue(item, options)).join('\n');
    str += `</template>`;
  } else if (json.name === 'Show') {
    str += `<template v-if="${stripStateAndPropsRefs(
      json.bindings.when as string,
    )}">`;
    str += json.children.map((item) => blockToVue(item, options)).join('\n');
    str += `</template>`;
  } else {
    str += `<${json.name} `;

    if (json.bindings._spread) {
      str += `v-bind="${stripStateAndPropsRefs(
        json.bindings._spread as string,
      )}"`;
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
      const useValue = stripStateAndPropsRefs(value);

      if (key.startsWith('on')) {
        const event = key.replace('on', '').toLowerCase();
        // TODO: proper babel transform to replace. Util for this
        const finalValue = useValue.replace(/event\./g, '$event.');
        str += ` @${event}="${finalValue}" `;
      } else if (key === 'ref') {
        str += ` ref="${useValue}" `;
      } else {
        str += ` :${key}="${useValue}" `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children.map((item) => blockToVue(item, options)).join('\n');
    }

    str += `</${json.name}>`;
  }
  return str;
};

export const componentToVue = (
  componentJson: JSXLiteComponent,
  options: ToVueOptions = {},
) => {
  // Make a copy we can safely mutate, similar to babel's toolchain
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }

  mapRefs(json, (refName) => `this.$refs.${refName}`);

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }
  const css = collectCss(json);

  let dataString = getStateObjectString(json, {
    data: true,
    functions: false,
    getters: false,
  });

  const getterString = getStateObjectString(json, {
    data: false,
    getters: true,
    functions: false,
    valueMapper: (code) =>
      stripStateAndPropsRefs(code.replace(/^get /, ''), {
        replaceWith: 'this.',
      }),
  });
  const functionsString = getStateObjectString(json, {
    data: false,
    getters: false,
    functions: true,
    valueMapper: (code) =>
      stripStateAndPropsRefs(code, { replaceWith: 'this.' }),
  });

  // Append refs to data as { foo, bar, etc }
  dataString = dataString.replace(
    /}$/,
    `${json.imports
      .map((thisImport) => Object.keys(thisImport.imports).join(','))
      .filter(Boolean)
      .join(',')}}`,
  );

  let str = dedent`
    <template>
      ${json.children.map((item) => blockToVue(item)).join('\n')}
    </template>
    <script>
      ${renderPreComponent(json)}

      export default {
        ${
          dataString.length < 4
            ? ''
            : `
        data: () => (${dataString}),
        `
        }
        ${
          getterString.length < 4
            ? ''
            : `
          computed: ${getterString},
        `
        }
        ${
          functionsString.length < 4
            ? ''
            : `
          methods: ${functionsString},
        `
        }
      }
    </script>
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
        parser: 'vue',
        plugins: [
          // To support running in browsers
          require('prettier/parser-html'),
          require('prettier/parser-postcss'),
          require('prettier/parser-babel'),
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
