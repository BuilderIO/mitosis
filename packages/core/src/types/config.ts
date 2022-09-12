import { MitosisComponent } from './mitosis-component';

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
   * Configure the extension of the files you want to compile
   * Default value: 'lite.tsx'
   */
  extension?: string;
  /**
   * Configure a custom parser function which takes a string and returns MitosisJSON
   * Defaults to the JSXParser of this project (src/parsers/jsx)
   */
  parser?: (code: string, path?: string) => MitosisComponent;
};
