import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { fastClone } from '../helpers/fast-clone';
import { getComponents } from '../helpers/get-components';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToJsxLiteOptions = {
  prettier?: boolean;
};
export const blockToJsxLite = (
  json: JSXLiteNode,
  options: ToJsxLiteOptions = {},
): string => {
  if (json.name === 'For') {
    const needsWrapper = json.children.length !== 1;
    return `<For each={${json.bindings.each}}>
    {(${json.bindings._forName}, index) =>
      ${needsWrapper ? '<>' : ''}
        ${json.children.map((child) => blockToJsxLite(child, options))}}
      ${needsWrapper ? '</>' : ''}
    </For>`;
  }

  if (json.properties._text) {
    return json.properties._text as string;
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
    str += json.children
      .map((item) => blockToJsxLite(item, options))
      .join('\n');
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

const jsxLiteCoreComponents = ['Show', 'For'];

export const componentToJsxLite = (
  componentJson: JSXLiteComponent,
  options: ToJsxLiteOptions = {},
) => {
  const json = fastClone(componentJson);

  const refs = getRefs(json);

  mapRefs(json, (refName) => `${refName}.current`);

  const addWrapper = json.children.length > 1;

  const components = Array.from(getComponents(json));

  const jsxLiteComponents = components.filter((item) =>
    jsxLiteCoreComponents.includes(item),
  );
  const otherComponents = components.filter(
    (item) => !jsxLiteCoreComponents.includes(item),
  );

  const hasState = Boolean(Object.keys(componentJson.state).length);

  const needsJsxLiteCoreImport = Boolean(
    hasState || refs.size || jsxLiteComponents.length,
  );

  // TODO: smart only pull in imports as needed
  let str = dedent`
    ${
      !needsJsxLiteCoreImport
        ? ''
        : `import { ${!hasState ? '' : 'useState, '} ${
            !refs.size ? '' : 'useRef, '
          } ${jsxLiteComponents.join(', ')} } from '@jsx-lite/core';`
    }
    ${
      !otherComponents.length
        ? ''
        : `import { ${otherComponents.join(
            ',',
          )} } from '@builder.io/components';`
    }
    ${renderPreComponent(json)}

    export default function MyComponent(props) {
      ${
        !hasState
          ? ''
          : `const state = useState(${getStateObjectString(json)});`
      }
      ${getRefsString(json)}

      return (${addWrapper ? '<div>' : ''}
        ${json.children.map((item) => blockToJsxLite(item)).join('\n')}
        ${addWrapper ? '</div>' : ''})
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
