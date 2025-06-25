import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToBuilderOptions extends BaseTranspilerOptions {
  includeIds?: boolean;
  stateMap?: Map<string, string>;
}

export type BuilderMetadata = {};
