import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToMitosisOptions extends BaseTranspilerOptions {
  format: 'react' | 'legacy';
  nativeConditionals?: boolean;
  nativeLoops?: boolean;
  returnArray?: boolean;
  addCloseTagIdComments?: boolean;
}

export type MitosisMetadata = {};
