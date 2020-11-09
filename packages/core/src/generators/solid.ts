import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToSolidOptions = {
  prettier?: boolean;
};
const blockToSolid = (json: JSXLiteNode, options: ToSolidOptions = {}) => {
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

    if (key.startsWith('on')) {
      str += ` ${key}={event => (${value})} `;
    } else {
      str += ` ${key}={${json5.stringify(value)}} `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToSolid(item, options)).join('\n');
  }

  str += `</${json.name}>`;
  return str;
};
const componentToSolid = (
  json: JSXLiteComponent,
  options: ToSolidOptions = {},
) => {
  let str = dedent`
    import { createMutable } from 'solid-js';
    ${renderPreComponent(json)}
    
    export default function MyComponent () {
      const state = createMutable(${json5.stringify(json.state)});

      return (<>
        ${json.children.map((item) => blockToSolid(item)).join('\n')}
      </>)
    }
   
  `;

  if (options.prettier !== false) {
    str = format(str, { parser: 'babel' });
  }
  return str;
};
