import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier';
import traverse from 'traverse';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import {
  selfClosingTags,
} from '../parse';
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

  let str = '';

  if (json.name === 'For') {
    str += `{${json.bindings._forEach}.map(${json.bindings._forName} => (
      <>
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
      </>
    ))}`;
  } else if (json.name === 'Show') {
    str += `{Boolean(${json.bindings._when}) && (<>
      ${json.children.map((item) => blockToReact(item, options)).join('\n')}
      </>
    )}`;
  } else {
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
      str += json.children
        .map((item) => blockToReact(item, options))
        .join('\n');
    }

    str += `</${json.name}>`;
  }

  return str;
};


const getRefsString = (json: JSXLiteComponent) => {
  let str = '';
  const refs = getRefs(json);

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
};

export const componentToReact = (
  componentJson: JSXLiteComponent,
  options: ToReactOptions = {},
) => {
  const json = fastClone(componentJson);

  mapRefs(json, (refName) => `${refName}.current`);

  let str = dedent`
    import { useState, useRef } from '@jsx-lite/react';
    ${renderPreComponent(json)}
    ${getRefsString(json)}
    
    export default function MyComponent(props) {
      const state = useState(() => (${getStateObjectString(json)}));

      return (<>
        ${json.children.map((item) => blockToReact(item)).join('\n')}
      </>)
    }
   
  `;

  if (options.prettier !== false) {
    try {
      str = format(str, { parser: 'typescript' });
    } catch (err) {
      console.error(
        'Format error for file:',
        str,
        JSON.stringify(json, null, 2),
      );
      throw err;
    }
  }
  return str;
};
