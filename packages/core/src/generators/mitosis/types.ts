import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToMitosisOptions extends BaseTranspilerOptions {
  format: 'react' | 'legacy';
}

export type MitosisMetadata = {};
