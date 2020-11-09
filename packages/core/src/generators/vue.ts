import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier';
import { renderImports } from '../helpers/render-imports';
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

  let str = `<${json.name} `;
  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    // TODO: proper babel transform to replace. Util for this
    const useValue = value.replace(/state\./g, '');

    if (key.startsWith('on')) {
      const event = key.replace('on', '').toLowerCase();
      str += ` @${event}="${useValue}" `;
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
  return str;
};
export const componentToVue = (
  json: JSXLiteComponent,
  options: ToVueOptions = {},
) => {
  let str = dedent`
    <template>
      ${json.children.map((item) => blockToVue(item)).join('\n')}
    </template>
    <script>
      ${renderImports(json.imports)}
      
      export default {
        data: () => (${json5.stringify(json.state)})
      }
    </script>
  `;

  if (options.prettier !== false) {
    str = format(str, { parser: 'html' });
  }
  return str;
};
