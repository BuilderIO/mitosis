import { BaseTranspilerOptions } from 'src/types/transpiler';

export type ToSvelteOptions = BaseTranspilerOptions & {
  stateType?: 'proxies' | 'variables';
};
