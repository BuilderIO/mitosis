import { JSXLiteComponent } from '../types/jsx-lite-Component';

export const createJSXLiteComponent = (
  options?: Partial<JSXLiteComponent>,
): JSXLiteComponent => ({
  '@type': '@jsx-lite/component',
  imports: [],
  state: {},
  children: [],
  hooks: {},
  ...options,
});
