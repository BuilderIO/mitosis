import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToLiquidOptions extends BaseTranspilerOptions {
  reactive?: boolean;
}

export type LiquidMetadata = {};
