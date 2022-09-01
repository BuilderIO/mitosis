import * as babel from '@babel/core';
import generate from '@babel/generator';
import { tryParseJson } from '../../helpers/json';

const { types } = babel;

export const selfClosingTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const uncapitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
};

export const parseCodeJson = (node: babel.types.Node) => {
  const code = generate(node).code;
  return tryParseJson(code);
};

export const isImportOrDefaultExport = (node: babel.Node) =>
  types.isExportDefaultDeclaration(node) || types.isImportDeclaration(node);
