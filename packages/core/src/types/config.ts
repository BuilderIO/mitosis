import { MitosisComponent } from './mitosis-component';
import { TranspilerGenerator } from './transpiler';

export type Format = 'esm' | 'cjs';
export type Language = 'js' | 'ts';
interface TranspilerOptions {
  format?: Format;
}

type Targets = typeof import('../targets').targets;
export type Target = keyof Targets;
export type GeneratorOptions = {
  [K in Target]: NonNullable<Parameters<Targets[K]>[0]> & {
    transpiler?: TranspilerOptions;
  };
};

export interface TargetContext {
  target: Target;
  generator: TranspilerGenerator<NonNullable<MitosisConfig['options'][Target]>>;
  outputPath: string;
}

export interface OutputFiles {
  outputDir: string;
  outputFilePath: string;
}

export interface MitosisPlugin {
  name: string;
  order: number;
  [HookType.BeforeBuild]: (TargetContexts: TargetContext[]) => void | Promise<void>;
  [HookType.Afterbuild]: (
    TargetContext: TargetContext,
    files: {
      componentFiles: OutputFiles[];
      nonComponentFiles: OutputFiles[];
    },
  ) => void | Promise<void>;
}

export type MitosisPluginFn = () => Partial<MitosisPlugin>;

export enum HookType {
  BeforeBuild = 'beforeBuild',
  Afterbuild = 'afterbuild',
}

export type MitosisConfig = {
  /**
   * List of targets to compile to.
   */
  targets: Target[];
  /**
   * The output directory. Defaults to `output`.
   */
  dest?: string;
  /**
   * globs of files to transpile. Defaults to `src/*`.
   */
  files?: string | string[];

  /**
   * Optional list of globs to exclude from transpilation.
   */
  exclude?: string[];
  /**
   * The directory where overrides are stored. The structure of the override directory must match that of the source code,
   * with each target having its own sub-directory: `${overridesDir}/${target}/*`
   * Defaults to `overrides`.
   */
  overridesDir?: string;
  /**
   * Dictionary of per-target configuration. For each target, the available options can be inspected by going to
   * `packages/core/src/targets.ts` and looking at the first argument of the desired generator.
   *
   * Example:
   *
   * ```js
   * options: {
   *   vue: {
   *     prettier: false,
   *     namePrefix: (path) => path + '-my-vue-code',
   *   },
   *   react: {
   *     stateType: 'builder';
   *     stylesType: 'styled-jsx'
   *   }
   * }
   * ```
   */
  options: Partial<GeneratorOptions>;

  /**
   * hooks
   */
  plugins?:
    | Partial<MitosisPlugin>
    | (() => Partial<MitosisPlugin>)
    | Array<Partial<MitosisPlugin> | MitosisPluginFn>;
  /**
   * Configure a custom parser function which takes a string and returns MitosisJSON
   * Defaults to the JSXParser of this project (src/parsers/jsx)
   */
  parser?: (code: string, path?: string) => MitosisComponent | Promise<MitosisComponent>;

  /**
   * Configure a custom function that provides the output path for each target.
   * If you provide this function, you must provide a value for every target yourself.
   */
  getTargetPath: ({ target }: { target: Target }) => string;
};
