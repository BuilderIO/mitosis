import { MitosisState } from './mitosis-component';

export type MitosisContext = {
  '@type': '@builder.io/mitosis/context';
  name: string;
  value: MitosisState;
};
