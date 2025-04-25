import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToSwiftOptions extends BaseTranspilerOptions {
  /**
   * Format generated Swift code
   * @default true
   */
  formatCode?: boolean;

  /**
   * Include type annotations in Swift code
   * @default true
   */
  includeTypes?: boolean;

  /**
   * Type of state management to use
   * @default 'state'
   */
  stateType?: 'state' | 'stateObject' | 'observable';

  /**
   * Prefix for class names
   * @default ''
   */
  classPrefix?: string;

  /**
   * Whether to include SwiftUI preview code
   * @default true
   */
  includePreview?: boolean;
}

export type SwiftMetadata = {};
