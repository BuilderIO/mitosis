import { OutputFiles, TargetContext } from '@/types/config';
import { MitosisComponent } from './mitosis-component';

export type MitosisBuildPlugin = (
  targetContext: TargetContext,
  files?: {
    componentFiles: OutputFiles[];
    nonComponentFiles: OutputFiles[];
  },
) => void | Promise<void>;

export type MitosisJsonPlugin = (json: MitosisComponent) => MitosisComponent | void;

export type MitosisCodePlugin = (code: string, json: MitosisComponent) => string;

export type MitosisHook<T> = {
  pre?: T;
  post?: T;
};

export type MitosisPlugin = (options?: any) => {
  name?: string;
  order?: number;
  // Happens before/after build
  build?: MitosisHook<MitosisBuildPlugin>;
  // Happens before/after any modifiers
  json?: MitosisHook<MitosisJsonPlugin>;
  // Happens before/after formatting
  code?: MitosisHook<MitosisCodePlugin>;
};
