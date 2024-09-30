import { Dictionary } from '@/helpers/typescript';
import { BaseTranspilerOptions } from '@/types/transpiler';

export type SolidState = 'mutable' | 'signals' | 'store';

export interface ToSolidOptions extends BaseTranspilerOptions {
  state: SolidState;
  stylesType?: 'styled-components' | 'style-tag';
}

export type SolidMetadata = {
  state?: Dictionary<SolidState>;
};
