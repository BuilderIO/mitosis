import { format } from 'prettier';
import { selfClosingTags } from '../parse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToLiquidOptions = {
  prettier?: boolean;
};
// TODO: spread support
const blockToLiquid = (json: JSXLiteNode, options: ToLiquidOptions = {}) => {
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
      // Do nothing
    } else {
      str += ` ${key}="{{${useValue}}}" `;
    }
  }
  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children.map((item) => blockToLiquid(item, options)).join('\n');
  }

  str += `</${json.name}>`;
  return str;
};

export const componentToLiquid = (
  json: JSXLiteComponent,
  options: ToLiquidOptions = {},
) => {
  let str = json.children.map((item) => blockToLiquid(item)).join('\n');

  if (options.prettier !== false) {
    str = format(str, { parser: 'html' });
  }
  return str;
};
