import { JSXLiteComponent } from '../types/mitosis-component';

export const createJSXLiteComponent = (
  options?: Partial<JSXLiteComponent>,
): JSXLiteComponent => ({
  '@type': '@builder.io/mitosis/component',
  imports: [],
  meta: {},
  state: {},
  children: [],
  hooks: {},
  context: { get: {}, set: {} },
  name: options?.name || 'MyComponent',
  subComponents: [],
  ...options,
});
