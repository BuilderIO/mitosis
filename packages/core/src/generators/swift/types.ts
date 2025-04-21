import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToSwiftOptions extends BaseTranspilerOptions {
  includeBindingsAsJs?: boolean;
}

export type SwiftMetadata = {};
