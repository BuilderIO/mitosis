import { tryParseJson } from '@/helpers/json';
import { objectHasKey } from '@/helpers/typescript';
import { Context } from '@/parsers/jsx/types';
import * as babel from '@babel/core';
import { BabelFileResult } from '@babel/core';
import generate from '@babel/generator';
import tsPlugin from '@babel/plugin-syntax-typescript';
import tsPreset from '@babel/preset-typescript';
import { Visitor } from '@babel/traverse';

const typescriptBabelPreset = [tsPreset, { isTSX: true, allExtensions: true }];

const { types } = babel;

export const uncapitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
};

export const parseCode = (node: babel.types.Node) => {
  const generatorResult = generate(node);
  return generatorResult.code;
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

export const babelStripTypes = (code: string, typescript?: boolean): string =>
  typescript
    ? (babel.transform(code, {
        configFile: false,
        babelrc: false,
        presets: [typescriptBabelPreset],
      })?.code as string)
    : code;

export const babelDefaultTransform = (
  code: string,
  visitor: Visitor<Context>,
): BabelFileResult | null =>
  babel.transform(code, {
    configFile: false,
    babelrc: false,
    comments: false,
    plugins: [[tsPlugin, { isTSX: true }], (): babel.PluginObj<Context> => ({ visitor })],
  });

export const isTypescriptFile = (fileName: string): boolean =>
  fileName.endsWith('.ts') || fileName.endsWith('.tsx');
