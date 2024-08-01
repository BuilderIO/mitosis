import { BaseTranspilerOptions } from '@/types/transpiler';

export const BUILT_IN_COMPONENTS = new Set(['Show', 'For', 'Fragment', 'Slot']);

export interface ToAngularOptions extends BaseTranspilerOptions {
  standalone?: boolean;
  preserveImports?: boolean;
  preserveFileExtensions?: boolean;
  importMapper?: Function;
  bootstrapMapper?: Function;
  visuallyIgnoreHostElement?: boolean;
}

export const DEFAULT_ANGULAR_OPTIONS: ToAngularOptions = {
  preserveImports: false,
  preserveFileExtensions: false,
  visuallyIgnoreHostElement: true,
};

export interface AngularBlockOptions {
  childComponents?: string[];
  nativeAttributes?: string[]; // set by useMetadata (packages/core/src/types/metadata.ts)
  selector?: string; // set by useMetadata (packages/core/src/types/metadata.ts)
}
