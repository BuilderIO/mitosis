import { Binding } from '../types/mitosis-node';

export const createSingleBinding = (args: Omit<Binding, 'type'>): Binding => ({
  ...args,
  type: 'single',
});
