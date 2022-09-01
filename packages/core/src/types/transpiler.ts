import { MitosisComponent } from './mitosis-component';
import { Plugin } from './plugins';

export interface TranspilerArgs {
  path?: string;
  component: MitosisComponent;
}

export type Transpiler<R = string> = (args: TranspilerArgs) => R;

/**
 * This type guarantees that all code generators receive the same base options
 */
export type TranspilerGenerator<X extends BaseTranspilerOptions, Y = string> = (
  args: X,
) => Transpiler<Y>;

export interface BaseTranspilerOptions {
  experimental?: { [key: string]: any };
  prettier?: boolean;
  plugins?: Plugin[];
  typescript?: boolean;
}
