import { MitosisComponent } from '..';
import { Plugin } from './plugins';

type Targets = typeof import('../targets').targets;
export type Target = keyof Targets;
export type GeneratorOptions = {
  [K in keyof Targets]: NonNullable<Parameters<Targets[K]>[0]>;
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
  prettier?: boolean;
  plugins?: Plugin[];
}

export type MitosisConfig = {
  type?: 'library'; // Only one type right now
  targets: Target[];
  dest?: string;
  files?: string | string[];
  overridesDir?: string;
  mapFile?: (info: FileInfo) => FileInfo | Promise<FileInfo>;
  options: Partial<GeneratorOptions>;
};
