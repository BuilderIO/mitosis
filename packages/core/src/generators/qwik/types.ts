import { Dictionary } from '@/helpers/typescript';
import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToQwikOptions extends BaseTranspilerOptions {}

export type QwikMetadata = {
  component?: {
    isLight?: boolean;
  };
  setUseStoreFirst?: boolean;
  hasDeepStore?: boolean;
  mutable?: string[];
  imports?: Dictionary<string>;
  replace?: Record<string, string>;
};
