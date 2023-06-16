import * as babel from '@babel/core';
import generate from '@babel/generator';
import { tryParseJson } from '../../helpers/json';
import { objectHasKey } from '../../helpers/typescript';

const { types } = babel;

export const uncapitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
};

export const parseCode = (node: babel.types.Node) => {
  return generate(node).code;
};

export const parseCodeJson = (node: babel.types.Node) => {
  const code = parseCode(node);
  return tryParseJson(code);
};

export const isImportOrDefaultExport = (node: babel.Node) =>
  types.isExportDefaultDeclaration(node) || types.isImportDeclaration(node);

export const HTML_ATTR_FROM_JSX = {
  htmlFor: 'for',
};

export const transformAttributeName = (name: string) => {
  if (objectHasKey(HTML_ATTR_FROM_JSX, name)) return HTML_ATTR_FROM_JSX[name];
  return name;
};
