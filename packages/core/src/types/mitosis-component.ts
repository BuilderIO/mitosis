import { Dictionary } from '../helpers/typescript';
import { Target } from './config';
import { JSONObject } from './json';
import { ComponentMetadata } from './metadata';
import { MitosisNode } from './mitosis-node';

/**
 * @example
 *  // import core, { useState, someThing as someAlias } from '@builder.io/mitosis'
 *  {
 *    path: '@builder.io/mitosis',
 *    imports: {
 *      useState: 'useState',
 *      someAlias: 'someThing',
 *      core: 'default',
 *    }
 *  }
 *
 * @example
 *  // import * as core from '@builder.io/mitosis'
 *  {
 *    path: '@builder.io/mitosis',
 *    imports: {
 *      core: '*',
 *    }
 *  }
 */
export interface MitosisImport {
  path: string;
  imports: {
    [key: string]: string | undefined;
  };
  importKind?: 'type' | 'typeof' | 'value' | null;
}

export type ReactivityType = 'normal' | 'reactive';

export type ContextOptions = {
  type?: ReactivityType;
};
export interface ContextGetInfo extends ContextOptions {
  name: string;
  path: string;
}
export interface ContextSetInfo extends ContextOptions {
  name: string;
  value?: MitosisState;
  ref?: string;
}

export type BaseHook = { code: string; deps?: string; depsArray?: string[] };

export type MitosisComponentInput = {
  name: string;
  defaultValue: any;
};

export type MitosisExports = {
  [name: string]: MitosisExport;
};

export interface MitosisExport {
  code: string;
  usedInLocal?: boolean;
  isFunction?: boolean;
}

export type StateValueType = 'function' | 'getter' | 'method' | 'property';

export type StateValue = {
  code: string;
  typeParameter?: string;
  type: StateValueType;
  propertyType?: ReactivityType;
};

export type MitosisState = Dictionary<StateValue | undefined>;

export type TargetBlock<Return, Targets extends Target = Target> = Partial<{
  [T in Targets | 'default']?: Return;
}>;

export type TargetBlockCode = TargetBlock<{
  code: string;
}>;

export type TargetBlockDefinition = TargetBlockCode & {
  settings: {
    requiresDefault: boolean;
  };
};

export type OnEventHook = BaseHook & {
  refName: string;
  eventName: string;
  isRoot: boolean;
  deps?: never;
  eventArgName: string;
  elementArgName?: string;
};

export type OnMountHook = BaseHook & {
  onSSR?: boolean;
};

export type MitosisComponent = {
  '@type': '@builder.io/mitosis/component';
  name: string;
  imports: MitosisImport[];
  exports?: MitosisExports;
  meta: JSONObject & {
    useMetadata?: ComponentMetadata;
  };
  inputs: MitosisComponentInput[];
  state: MitosisState;
  context: {
    get: Dictionary<ContextGetInfo>;
    set: Dictionary<ContextSetInfo>;
  };
  signals?: {
    signalTypeImportName?: string;
  };
  props?: {
    [name: string]: {
      propertyType: ReactivityType;
      optional: boolean;
    };
  };
  refs: {
    [useRef: string]: {
      typeParameter?: string;
      argument: string;
    };
  };
  hooks: {
    init?: BaseHook;
    onInit?: BaseHook;
    onMount: OnMountHook[];
    onUnMount?: BaseHook;
    preComponent?: BaseHook;
    postComponent?: BaseHook;
    onUpdate?: BaseHook[];
    onEvent: OnEventHook[];
  };
  targetBlocks?: Dictionary<TargetBlockDefinition>;
  children: MitosisNode[];
  subComponents: MitosisComponent[];
  types?: string[];
  propsTypeRef?: string;
  defaultProps?: MitosisState;
  style?: string;

  /**
   * This data is filled inside cli to provide more data for plugins
   */
  pluginData?: {
    target?: Target;
    path?: string;
    outputDir?: string;
    outputFilePath?: string;
  };

  /**
   * Used to store context of a component for a specific framework
   * that we need access only during compilation (for internal use only) and gets removed after compilation.
   */
  compileContext?: {
    [K in Target]?: {
      state?: MitosisState;
      hooks?: {
        [hookName: string]: BaseHook;
      };
    };
  };
};
