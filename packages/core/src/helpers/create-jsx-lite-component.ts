import { JSXLiteComponent } from '../types/jsx-lite-component';

export const createJSXLiteComponent = (
  options?: Partial<JSXLiteComponent>,
): JSXLiteComponent => ({
  '@type': '@jsx-lite/component',
  imports: [],
  meta: {},
  state: {},
  children: [],
  hooks: {},
  name: options?.name || 'MyComponent',
  ...options,
});
