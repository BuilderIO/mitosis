import * as babel from '@babel/core';

import tsPlugin from '@babel/plugin-syntax-typescript';
import tsPreset from '@babel/preset-typescript';
import decorators from '@babel/plugin-syntax-decorators';

export function parseCode(code: string) {
  const ast = babel.parse(code, {
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    plugins: [
      [tsPlugin, { isTSX: true }],
      [decorators, { legacy: true }],
    ],
  });
  const body = babel.types.isFile(ast)
    ? ast.program.body
    : babel.types.isProgram(ast)
    ? ast.body
    : [];
  return body;
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
