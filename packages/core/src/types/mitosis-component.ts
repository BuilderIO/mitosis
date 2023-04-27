import { Dictionary } from '../helpers/typescript';
import { JSONObject } from './json';
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

export interface ContextGetInfo {
  name: string;
  path: string;
}
export interface ContextSetInfo {
  name: string;
  value?: MitosisState;
  ref?: string;
}

export type extendedHook = { code: string; deps?: string };

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
  type: StateValueType;
  typeParameter?: string;
};

export type MitosisState = Dictionary<StateValue | undefined>;

export type MitosisComponent = {
  '@type': '@builder.io/mitosis/component';
  name: string;
  imports: MitosisImport[];
  exports?: MitosisExports;
  meta: JSONObject & {
    useMetadata?: JSONObject;
  };
  inputs: MitosisComponentInput[];
  state: MitosisState;
  context: {
    get: Dictionary<ContextGetInfo>;
    set: Dictionary<ContextSetInfo>;
  };
  refs: {
    [useRef: string]: {
      typeParameter?: string;
      argument: string;
    };
  };
  hooks: {
    init?: extendedHook;
    onInit?: extendedHook;
    onMount?: extendedHook;
    onUnMount?: extendedHook;
    preComponent?: extendedHook;
    postComponent?: extendedHook;
    onUpdate?: extendedHook[];
  };
  children: MitosisNode[];
  subComponents: MitosisComponent[];
  types?: string[];
  propsTypeRef?: string;
  defaultProps?: MitosisState;
  style?: string;
};
