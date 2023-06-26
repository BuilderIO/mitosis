import { ContextOptions, MitosisState } from './mitosis-component';

export type MitosisContext = ContextOptions & {
  '@type': '@builder.io/mitosis/context';
  name: string;
  value: MitosisState;
};
