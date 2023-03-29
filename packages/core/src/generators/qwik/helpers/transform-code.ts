import { babelTransformExpression } from '../../../helpers/babel-transform';

export function convertTypeScriptToJS(code: string): string {
  return babelTransformExpression(code, {});
}
