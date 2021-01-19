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
  let useCode = code;

  // Detect method fragments. These get passed sometimes and otherwise
  // generate compile errors. They are of the form `foo() { ... }`
  const isMethod = Boolean(
    !code.startsWith('function') && code.match(/^[a-z0-9]+\s*\([^\)]*\)\s*\{/i),
  );

  if (isMethod) {
    useCode = `function ${useCode}`;
  }
  useCode = `let _ = ${useCode}`;
  const result = (babelTransform(useCode, visitor)?.code || '')
    .replace(/;$/, '')
    .replace(/let _ =\s/, '');

  return isMethod ? result.replace('function', '') : result;
};
