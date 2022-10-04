import { Dictionary } from '../helpers/typescript';
import { _JSON, JSONObject } from './json';
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

export type ContextGet = { [key: string]: ContextGetInfo };
export type ContextSet = { [key: string]: ContextSetInfo };

export type extendedHook = { code: string; deps?: string };

export type MitosisComponentInput = {
  name: string;
  defaultValue: any;
};

export type MitosisExport = {
  [name: string]: {
    code: string;
    usedInLocal?: boolean;
    isFunction?: boolean;
  };
};

export type StateValueType = 'function' | 'getter' | 'method' | 'property';

export type StateCode = _JSON;

type CodeValue = {
  code: string;
  type: Exclude<StateValueType, 'property'>;
};

export const checkIsCodeValue = (value: unknown): value is CodeValue => {
  return typeof value === 'object' &&
    value &&
    Object.keys(value).length === 2 &&
    'type' in value &&
    'code' in value
    ? ['function', 'getter', 'method'].includes((value as any).type)
    : false;
};

export type StateValue =
  | CodeValue
  | {
      code: StateCode;
      type: Extract<StateValueType, 'property'>;
    };

export type MitosisState = Dictionary<StateValue | undefined>;

export type MitosisComponent = {
  '@type': '@builder.io/mitosis/component';
  name: string;
  imports: MitosisImport[];
  exports?: MitosisExport;
  meta: JSONObject & {
    useMetadata?: JSONObject;
  };
  inputs: MitosisComponentInput[];
  state: MitosisState;
  context: {
    get: ContextGet;
    set: ContextSet;
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
  defaultProps?: JSONObject;
  style?: string;
};
