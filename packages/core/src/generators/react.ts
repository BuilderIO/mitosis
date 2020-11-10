import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToReactOptions = {
  prettier?: boolean;
};
const blockToReact = (json: JSXLiteNode, options: ToReactOptions = {}) => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = `<${json.name} `;

  if (json.bindings._spread) {
    str += ` {...(${json.bindings._spread})} `;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    const value = json.bindings[key] as string;
    if (key === '_spread') {
      continue;
    }

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
    str += json.children.map((item) => blockToReact(item, options)).join('\n');
  }

  str += `</${json.name}>`;
  return str;
};
export const componentToReact = (
  json: JSXLiteComponent,
  options: ToReactOptions = {},
) => {
  let str = dedent`
    import { useState } from '@jsx-lite/react';
    ${renderPreComponent(json)}
    
    export default function MyComponent(props) {
      const state = useState(() => (${json5.stringify(json.state)}));

      return (<>
        ${json.children.map((item) => blockToReact(item)).join('\n')}
      </>)
    }
   
  `;

  if (options.prettier !== false) {
    str = format(str, { parser: 'babel' });
  }
  return str;
};
