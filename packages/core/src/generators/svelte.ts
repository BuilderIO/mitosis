import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier';
import { renderImports } from '../helpers/render-imports';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToSvelteOptions = {
  prettier?: boolean;
};
const blockToSvelte = (json: JSXLiteNode, options: ToSvelteOptions = {}) => {
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
      str += ` on:${event}={event => ${useValue}} `;
    } else {
      str += ` ${key}={${useValue}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToSvelte(item, options)).join('\n');
  }

  str += `</${json.name}>`;
  return str;
};
const componentToSvelte = (
  json: JSXLiteComponent,
  options: ToSvelteOptions = {},
) => {
  let str = dedent`
    <script>
      ${renderImports(json.imports)}

      ${Object.keys(json.state)
        .map((key) => `let ${key} = ${json5.stringify(json.state[key])};`)
        .join('\n')}
    </script>
    ${json.children.map((item) => blockToSvelte(item)).join('\n')}
  `;

  if (options.prettier !== false) {
    str = format(str, { parser: 'html' });
  }
  return str;
};
