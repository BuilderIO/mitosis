import * as babel from '@babel/core';
const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');
const decorators = require('@babel/plugin-syntax-decorators');
import type { Visitor } from '@babel/traverse';
import { pipe } from 'fp-ts/lib/function';

const handleErrorOrExpression = <VisitorContextType = any>({
  code,
  useCode,
  result,
  visitor,
}: {
  code: string;
  useCode: string;
  result: string | null;
  visitor: Visitor<VisitorContextType>;
}) => {
  try {
    // If it can't, e.g. this is an expression or code fragment, modify the code below and try again

    // Detect method fragments. These get passed sometimes and otherwise
    // generate compile errors. They are of the form `foo() { ... }`
    const isMethod = Boolean(
      !code.startsWith('function') && code.match(/^[a-z0-9_]+\s*\([^\)]*\)\s*[\{:]/i),
    );

    if (isMethod) {
      useCode = `function ${useCode}`;
    }
    // Parse the code as an expression (instead of the default, a block) by giving it a fake variable assignment
    // e.g. if the code parsed is { ... } babel will treat that as a block by deafult, unless processed as an expression
    // that is an object
    useCode = `let _ = ${useCode}`;
    result = pipe(babelTransformCode(useCode, visitor), trimSemicolons, (str) =>
      // Remove our fake variable assignment
      str.replace(/let _ =\s/, ''),
    );
    if (isMethod) {
      return result.replace('function ', '');
    }
    return result;
  } catch (err) {
    console.error('Error parsing code:\n', code, '\n', result);
    throw err;
  }
};

export const babelTransform = <VisitorContextType = any>(
  code: string,
  visitor?: Visitor<VisitorContextType>,
) => {
  return babel.transform(code, {
    sourceFileName: 'file.tsx',
    configFile: false,
    babelrc: false,
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    parserOpts: { allowReturnOutsideFunction: true },
    plugins: [[decorators, { legacy: true }], jsxPlugin, ...(visitor ? [() => ({ visitor })] : [])],
  });
};
export const babelTransformCode = <VisitorContextType = any>(
  code: string,
  visitor?: Visitor<VisitorContextType>,
) => babelTransform(code, visitor)?.code || '';

// Babel adds trailing semicolons, but for expressions we need those gone
// TODO: maybe detect if the original code ended with one, and keep it if so, for the case
// of appending several fragements
const trimSemicolons = (code: string) => code.replace(/;$/, '');

const trimExpression = (type: ExpressionType) => (code: string) => {
  switch (type) {
    case 'functionBody':
      return code.replace(/^function\s*\(\)\s*\{/, '').replace(/\};?$/, '');
    default:
      return trimSemicolons(code);
  }
};

type ExpressionType = 'expression' | 'unknown' | 'block' | 'functionBody';

const getType = (code: string, initialType: ExpressionType): ExpressionType => {
  // match for object literal like { foo: ... }
  if (initialType === 'unknown' && code.trim().match(/^\s*{\s*[a-z0-9]+:/i)) {
    return 'expression';
  }

  // For Builder content
  if (
    initialType === 'unknown' &&
    (code.includes('return _virtual_index') || code.trim().startsWith('return ')) &&
    !code.trim().startsWith('function')
  ) {
    return 'functionBody';
  }

  return initialType;
};

export const babelTransformExpression = <VisitorContextType = any>(
  code: string,
  visitor: Visitor<VisitorContextType>,
  initialType: ExpressionType = 'unknown',
): string => {
  if (!code) {
    return '';
  }

  const type = getType(code, initialType);

  const useCode = type === 'functionBody' ? `function(){${code}}` : code;

  if (type !== 'expression') {
    try {
      return pipe(babelTransformCode(useCode, visitor), trimExpression(type));
    } catch (error) {
      return handleErrorOrExpression({ code, useCode, result: null, visitor });
    }
  } else {
    return handleErrorOrExpression({ code, useCode, result: null, visitor });
  }
};
