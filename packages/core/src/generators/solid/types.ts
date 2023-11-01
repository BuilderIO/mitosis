import { BaseTranspilerOptions } from 'src/types/transpiler';

export type SolidState = 'mutable' | 'signals' | 'store';

export interface ToSolidOptions extends BaseTranspilerOptions {
  state: SolidState;
  stylesType?: 'styled-components' | 'style-tag';
}
