import { babelTransformExpression } from 'src/helpers/babel-transform';

export function convertTypeScriptToJS(code: string): string {
  return babelTransformExpression(code, {});
}
