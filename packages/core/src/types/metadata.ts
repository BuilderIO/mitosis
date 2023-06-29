import { SolidState } from 'src/generators/solid/types';
import { Dictionary } from 'src/helpers/typescript';
import { Target } from '..';

type Targets = typeof import('../targets').targets;
type TargetOptions = {
  [K in Target]?: Partial<NonNullable<Parameters<Targets[K]>[0]>>;
};

export type ComponentMetadata = {
  [index: string]: any;
  options: TargetOptions;
  qwik?: {
    component?: {
      isLight?: boolean;
    };
    hasDeepStore?: boolean;
    mutable?: string[];
    imports?: Dictionary<string>;
    replace?: Record<string, string>;
  };
  solid?: {
    state?: Dictionary<SolidState>;
  };
};
