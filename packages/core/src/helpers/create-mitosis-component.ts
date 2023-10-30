import { MitosisComponent } from '../types/mitosis-component';
import { Overwrite, Prettify } from './typescript';

type PartialMitosisComponent = Prettify<
  Overwrite<
    Partial<MitosisComponent>,
    {
      hooks: Partial<MitosisComponent['hooks']>;
    }
  >
>;

export const createMitosisComponent = (options?: PartialMitosisComponent): MitosisComponent => {
  const { name, hooks, ...remainingOpts } = options || {};
  return {
    '@type': '@builder.io/mitosis/component',
    imports: [],
    exports: {},
    inputs: [],
    meta: {},
    refs: {},
    state: {},
    children: [],
    context: { get: {}, set: {} },
    subComponents: [],
    name: name || 'MyComponent',
    hooks: {
      onMount: hooks?.onMount || [],
      onEvent: hooks?.onEvent || [],
      ...hooks,
    },
    ...remainingOpts,
  };
};
