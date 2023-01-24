import { Binding } from '../types/mitosis-node';

export const createSingleBinding = (args: Omit<Binding, 'type'>): Binding => ({
  code: args.code,
  arguments: args.arguments,
  type: 'single',
});
