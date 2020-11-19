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

type ToReactOptions = {
  prettier?: boolean;
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToReactOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<>${json.children
      .map((item) => blockToReact(item, options))
      .join('\n')}</>`;
  },
};

const blockToReact = (json: JSXLiteNode, options: ToReactOptions = {}) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${json.bindings._text}}`;
  }

  let str = '';

  if (json.name === 'For') {
    str += `{${json.bindings.each}.map(${json.bindings._forName} => (
      <>
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
      </>
    ))}`;
  } else if (json.name === 'Show') {
    str += `{Boolean(${json.bindings.when}) && (<>
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

const getRefsString = (json: JSXLiteComponent, refs = getRefs(json)) => {
  let str = '';

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
    
    export default function MyComponent(props) {
      const state = useState(() => (${getStateObjectString(json)}));
      ${getRefsString(json)}

      return (<>
        ${json.children.map((item) => blockToReact(item)).join('\n')}
      </>)
    }
   
  `;

  if (options.prettier !== false) {
    try {
      str = format(str, {
        parser: 'typescript',
        plugins: [
          require('prettier/parser-typescript'), // To support running in browsers
        ],
      });
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
