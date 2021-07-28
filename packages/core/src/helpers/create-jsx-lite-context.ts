import { JSXLiteContext } from '../types/mitosis-context';

export function createJsxLiteContext(
  options: Partial<JSXLiteContext> & { name: string },
): JSXLiteContext {
  return {
    '@type': '@builder.io/mitosis/context',
    value: {},
    ...options,
  };
}
