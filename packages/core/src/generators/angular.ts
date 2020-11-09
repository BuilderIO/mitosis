import dedent from 'dedent';
import { format } from 'prettier';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToAngularOptions = {
  prettier?: boolean;
};
const blockToAngular = (json: JSXLiteNode, options: ToAngularOptions = {}) => {
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
      str += ` (${event})="${useValue}" `;
    } else {
      str += ` [${key}]="${useValue}" `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToAngular(item, options))
      .join('\n');
  }

  str += `</${json.name}>`;
  return str;
};

export const componentToAngular = (
  json: JSXLiteComponent,
  options: ToAngularOptions = {},
) => {
  let str = dedent`
    import { Component } from '@angular/core';
    ${renderPreComponent(json)}

    @Component({
      template: \`
        ${json.children.map((item) => blockToAngular(item)).join('\n')}
      \`
    })
    export default class MyComponent {
      ${Object.keys(json.state)
        .map((key) => ` ${key} = ${json.state[key]};`)
        .join('\n')}
    }
  `;

  if (options.prettier !== false) {
    str = format(str, { parser: 'typescript' });
  }
  return str;
};
