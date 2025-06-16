import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToBuilderOptions extends BaseTranspilerOptions {
  includeIds?: boolean;
  removeCircularReferences?: boolean;
}

export type BuilderMetadata = {};
