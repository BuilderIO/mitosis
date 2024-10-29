import * as babel from '@babel/core';

import decorators from '@babel/plugin-syntax-decorators';
import tsPlugin from '@babel/plugin-syntax-typescript';
import tsPreset from '@babel/preset-typescript';

export function parseCodeToAst(code: string) {
  return babel.parse(code, {
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    plugins: [
      [tsPlugin, { isTSX: true }],
      [decorators, { legacy: true }],
    ],
  });
}

export function parseCode(code: string) {
  const ast = parseCodeToAst(code);
  return babel.types.isFile(ast) ? ast.program.body : babel.types.isProgram(ast) ? ast.body : [];
}

export const isCodeBodyExpression = (body: babel.types.Statement[]) =>
  body.length == 1 &&
  (babel.types.isExpression(body[0]) || babel.types.isExpressionStatement(body[0]));

/**
 * Returns `true` if the `code` is a valid expression. (vs a statement)
 */
export function isExpression(code: string): boolean {
  try {
    const body = parseCode(code);
    return isCodeBodyExpression(body);
  } catch (e) {
    return false;
  }
}

export const isCodeBodyIdentifier = (body: babel.types.Statement[]) =>
  body.length == 1 && babel.types.isIdentifier(body[0]);
