import { BaseTranspilerOptions } from '@/types/transpiler';

export type ToSvelteOptions = BaseTranspilerOptions & {
  stateType?: 'proxies' | 'variables';
};

export type SvelteMetadata = {};
