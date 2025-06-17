import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToBuilderOptions extends BaseTranspilerOptions {
  includeIds?: boolean;
}

export type BuilderMetadata = {};
