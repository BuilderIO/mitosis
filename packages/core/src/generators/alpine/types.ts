import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToAlpineOptions extends BaseTranspilerOptions {
  /**
   * use @on and : instead of `x-on` and `x-bind`
   */
  useShorthandSyntax?: boolean;
  /**
   * If true, the javascript won't be extracted into a separate script block.
   */
  inlineState?: boolean;
}

export type AlpineMetadata = {};
