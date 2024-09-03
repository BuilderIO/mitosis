import { Target } from '..';
import { SolidState } from '../generators/solid/types';
import { Dictionary } from '../helpers/typescript';

type Targets = typeof import('../targets').targets;
type TargetOptions = {
  [K in Target]?: Partial<NonNullable<Parameters<Targets[K]>[0]>>;
};

export type ComponentMetadata = {
  [index: string]: any;
  httpRequests?: Record<string, string>;
  options?: TargetOptions;
  angular?: {
    /* Mitosis uses `attr.XXX` as default see https://angular.io/guide/attribute-binding. 
    If you want to skip some you can use the 'nativeAttributes'. */
    nativeAttributes?: string[];
    /* Overwrite default selector for component. Default will be kebab case (MyComponent -> my-component) */
    selector?: string;
  };
  qwik?: {
    component?: {
      isLight?: boolean;
    };
    setUseStoreFirst?: boolean;
    hasDeepStore?: boolean;
    mutable?: string[];
    imports?: Dictionary<string>;
    replace?: Record<string, string>;
  };
  solid?: {
    state?: Dictionary<SolidState>;
  };
  rsc?: {
    componentType?: 'client' | 'server';
  };
};
