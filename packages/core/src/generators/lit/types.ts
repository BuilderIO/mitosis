import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToLitOptions extends BaseTranspilerOptions {
  /**
   * Enabled shadowDOM for generated lit components. Default: enabled
   */
  useShadowDom?: boolean;
}

export type LitMetadata = {};
