import { MitosisComponent } from '..';
import { Plugin } from './plugins';

export type Format = 'esm' | 'cjs';
export interface TranspilerOptions {
  format?: Format;
}

type Targets = typeof import('../targets').targets;
export type Target = keyof Targets;
export type GeneratorOptions = {
  [K in keyof Targets]: NonNullable<Parameters<Targets[K]>[0]> & {
    transpiler?: TranspilerOptions;
  };
};

type FileInfo = {
  path: string;
  content: string;
  target: string;
};

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
  options: Partial<GeneratorOptions>;
};
