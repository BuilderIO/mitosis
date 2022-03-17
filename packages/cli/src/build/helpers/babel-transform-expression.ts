import * as babel from '@babel/core';
const tsPreset = require('@babel/preset-typescript');

export function babelTransformExpression<VisitorContextType = any>(
  code: string,
  visitor: VisitorContextType,
): string {
  return babel
    .transform(`let _ = ${code}`, {
      sourceFileName: 'file.tsx',
      configFile: false,
      babelrc: false,
      presets: [[tsPreset, { allExtensions: true }]],
      plugins: [() => ({ visitor })],
    })
    .code!.trim()
    .replace(/^(let|var)\s+_\s*=\s*/, '')
    .replace(/;$/, '');
}
