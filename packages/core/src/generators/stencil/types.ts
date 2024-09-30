import { BaseTranspilerOptions } from '@/types/transpiler';

export interface ToStencilOptions extends BaseTranspilerOptions {
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

export type StencilMetadata = {};
