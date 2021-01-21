import * as babel from '@babel/core';
import { isError } from 'lodash';
const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');
const decorators = require('@babel/plugin-syntax-decorators');

type Visitor<ContextType = any> = {
  [key: string]: (path: any, context: ContextType) => void;
};

export const babelTransform = <VisitorContextType = any>(
  code: string,
  visitor: Visitor<VisitorContextType>,
) => {
  return babel.transform(code, {
    sourceFileName: 'file.tsx',
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    plugins: [
      [decorators, { legacy: true }],
      jsxPlugin,
      () => ({
        visitor,
      }),
    ],
  });
};
export const babelTransformCode = <VisitorContextType = any>(
  code: string,
  visitor: Visitor<VisitorContextType>,
) => {
  return babelTransform(code, visitor)?.code || '';
};
export const babelTransformExpression = <VisitorContextType = any>(
  code: string,
  visitor: Visitor<VisitorContextType>,
  type: 'expression' | 'unknown' | 'block' = 'unknown',
): string => {
  // TODO: maybe match more strictly { foo: ... }
  if (type === 'unknown' && code.trim().startsWith('{')) {
    type = 'expression';
  }

  let result =
    type === 'expression'
      ? null
      : (babelTransform(code, visitor)?.code || '')
          // Babel addes trailing semicolons, but for expressions we need those gone
          // TODO: maybe detect if the original code ended with one, and keep it if so, for the case
          // of appending several fragements
          .replace(/;$/, '');

  if (isError(result) || type === 'expression') {
    // If it can't, e.g. this is an expression or code fragment, modify the code below and try again
    let useCode = code;

    // Detect method fragments. These get passed sometimes and otherwise
    // generate compile errors. They are of the form `foo() { ... }`
    const isMethod = Boolean(
      !code.startsWith('function') &&
        code.match(/^[a-z0-9]+\s*\([^\)]*\)\s*\{/i),
    );

    if (isMethod) {
      useCode = `function ${useCode}`;
    }
    // Parse the code as an expression (instead of the default, a block) by giving it a fake variable assignment
    // e.g. if the code parsed is { ... } babel will treat that as a block by deafult, unless processed as an expression
    // that is an object
    useCode = `let _ = ${useCode}`;
    result = (babelTransform(useCode, visitor)?.code || '')
      // Babel addes trailing semicolons, but for expressions we need those gone
      .replace(/;$/, '')
      // Remove our fake variable assignment
      .replace(/let _ =\s/, '');

    return isMethod ? result.replace('function', '') : result;
  } else {
    return result!;
  }
};
