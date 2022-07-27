import { BaseTranspilerOptions } from '../../types/transpiler';

export type SolidState = 'mutable' | 'signals';

export interface ToSolidOptions extends BaseTranspilerOptions {
  state: SolidState;
}
