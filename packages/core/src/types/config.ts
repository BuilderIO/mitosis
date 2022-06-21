import { Overwrite } from '../helpers/typescript';
import { MitosisComponent, VueVersion } from '..';
import { Plugin } from './plugins';

export type Format = 'esm' | 'cjs';
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

type ExternalVueOptions = Overwrite<
  GeneratorOptions['vue'],
  { vueVersion: { [T in VueVersion]?: boolean } }
>;

type Options = Overwrite<GeneratorOptions, { vue: ExternalVueOptions }>;

export interface TranspilerArgs {
  path?: string;
  component: MitosisComponent;
}

export type Transpiler = (args: TranspilerArgs) => string;

export interface BaseTranspilerOptions {
  experimental?: { [key: string]: any };
  prettier?: boolean;
  plugins?: Plugin[];
}

export type MitosisConfig = {
  type?: 'library'; // Only one type right now
  targets: Target[];
  dest?: string;
  files?: string | string[];
  overridesDir?: string;
  options: Partial<Options>;
};
