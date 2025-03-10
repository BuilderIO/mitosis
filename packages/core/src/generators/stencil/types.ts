import { BaseTranspilerOptions } from '@/types/transpiler';

// https://stenciljs.com/docs/properties#prop-options
export interface StencilPropOption {
  attribute?: string;
  mutable?: boolean;
  reflect?: boolean;
}

export interface StencilPropOptions {
  /**
   * Add additional options for Stencil properties: https://stenciljs.com/docs/properties#prop-options.
   * You need to map your properties you provide to the component.
   *
   * Example:
   * ```tsx
   *  propOptions: {
   *             className: {
   *                 attribute: 'classname',
   *                 mutable: false,
   *                 reflect: false,
   *             },
   *         }
   * ```
   */
  propOptions?: Record<string, StencilPropOption>;
}

export interface ToStencilOptions extends BaseTranspilerOptions, StencilPropOptions {
  /**
   * Add a prefix for every component like `my`.
   * A Stencil component needs a prefix with a dash.
   * You don't need this option if your Mitosis component includes the prefix already:
   *
   * Error: `export default function Button ...` ->  tag: 'button'
   * Success: `export default function MyButton ...` ->  tag: 'my-button'
   * Success: prefix="my" + `export default function Button ...` ->  tag: 'my-button'
   */
  prefix?: string;
}

export type StencilMetadata = {} & StencilPropOptions;
