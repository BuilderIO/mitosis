import * as babel from '@babel/core';
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
) => {
  const useCode = `let _ = ${code}`;
  return (babelTransform(useCode, visitor)?.code || '')
    .replace(/;$/, '')
    .replace(/let _ =\s/, '');
};
