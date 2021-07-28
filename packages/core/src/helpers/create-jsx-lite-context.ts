import { JSXLiteContext } from '../types/jsx-lite-context';

export function createJsxLiteContext(
  options: Partial<JSXLiteContext> & { name: string },
): JSXLiteContext {
  return {
    '@type': '@jsx-lite/context',
    value: {},
    ...options,
  };
}
