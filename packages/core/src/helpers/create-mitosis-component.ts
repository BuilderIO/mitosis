import { MitosisComponent } from '../types/mitosis-component';

export const createMitosisComponent = (
  options?: Partial<MitosisComponent>,
): MitosisComponent => ({
  '@type': '@builder.io/mitosis/component',
  imports: [],
  inputs: [],
  meta: {},
  state: {},
  children: [],
  hooks: {},
  context: { get: {}, set: {} },
  name: options?.name || 'MyComponent',
  subComponents: [],
  ...options,
});
