import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToSolidOptions = {
  prettier?: boolean;
};
const blockToSolid = (json: JSXLiteNode, options: ToSolidOptions = {}) => {
  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = '';

  str += `<${json.name} `;

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
      str += ` ${key}={${value}} `;
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

const getRefsString = (json: JSXLiteComponent, refs = getRefs(json)) => {
  let str = '';

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
};

export const componentToSolid = (
  json: JSXLiteComponent,
  options: ToSolidOptions = {},
) => {
  const addWrapper = json.children.length > 1;
  let str = dedent`
    import { createMutable, Show, For } from 'solid-js';
    ${renderPreComponent(json)}
    
    export default function MyComponent () {
      const state = createMutable(${getStateObjectString(json)});
      ${getRefsString(json)}

      return (${addWrapper ? '<>' : ''}
        ${json.children.map((item) => blockToSolid(item, options)).join('\n')}
        ${addWrapper ? '</>' : ''})
    }
   
  `;

  if (options.prettier !== false) {
    str = format(str, {
      parser: 'babel',
      plugins: [require('prettier/parser-babel')],
    });
  }
  return str;
};
