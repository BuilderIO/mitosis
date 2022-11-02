import { MitosisComponent } from './mitosis-component';
import { Plugin } from './plugins';

export interface TranspilerArgs {
  path?: string;
  component: MitosisComponent;
}

export type GeneratorOutput<R = string> = {
  // content of output. Currently either a component string or a builder component JSON.
  content: R;
  // in the future, we will add more types like 'styles' for CSS Modules, etc.
  type: 'css' | 'html' | 'js' | 'jsx' | 'component' | 'error';
};

export type Transpiler<R = string> = (args: TranspilerArgs) => GeneratorOutput<R>[];

/**
 * This type guarantees that all code generators receive the same base options
 */
export type TranspilerGenerator<X extends BaseTranspilerOptions, Y = string> = (
  args?: X,
) => Transpiler<Y>;

export interface BaseTranspilerOptions {
  experimental?: { [key: string]: any };
  prettier?: boolean;
  plugins?: Plugin[];
  typescript?: boolean;
}
