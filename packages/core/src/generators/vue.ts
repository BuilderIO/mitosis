import dedent from 'dedent';
import { format } from 'prettier';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

export type ToVueOptions = {
  prettier?: boolean;
};

export const blockToVue = (json: JSXLiteNode, options: ToVueOptions = {}) => {
  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `<template v-for="${json.bindings._forName} in ${json.bindings._forEach}">`;
    str += json.children.map((item) => blockToVue(item, options)).join('\n');
    str += `</template>`;
  } else if (json.name === 'Show') {
    str += `<template v-if="${json.bindings._when}">`;
    str += json.children.map((item) => blockToVue(item, options)).join('\n');
    str += `</template>`;
  } else {
    str += `<${json.name} `;

    if (json.bindings._spread) {
      str += `v-bind="${json.bindings._spread}"`;
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
      const useValue = value.replace(/state\./g, '').replace(/props\./g, '');

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
  const json = fastClone(componentJson);

  mapRefs(json, (refName) => `this.$refs.${refName}`);

  const css = collectCss(json);

  let dataString = getStateObjectString(json);

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
        data: () => (${dataString})
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

  if (options.prettier !== false) {
    str = format(str, { parser: 'html' });
  }
  return str;
};
