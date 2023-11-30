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
  args?: X,
) => Transpiler<Y>;

export interface BaseTranspilerOptions {
  experimental?: { [key: string]: any };
  /**
   * Runs `prettier` on generated components
   */
  prettier?: boolean;
  /**
   * Mitosis Plugins to run during codegen.
   */
  plugins?: Plugin[];
  /**
   * Enable `typescript` output
   */
  typescript?: boolean;
  /**
   * Preserves explicit filename extensions in import statements.
   */
  explicitImportFileExtension?: boolean;
}
