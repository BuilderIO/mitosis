import { BaseTranspilerOptions } from '../../types/transpiler';

export interface ToSvelteOptions extends BaseTranspilerOptions {
  stateType?: 'proxies' | 'variables';
}
