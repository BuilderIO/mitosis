import { JSON, JSONObject } from './json';
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

type ContextInfo = { name: string; path: string };

export type extendedHook = { code: string; deps?: string };

export type MitosisComponentInput = {
  name: string;
  defaultValue: any;
};

export type MitosisComponent = {
  '@type': '@builder.io/mitosis/component';
  name: string;
  imports: MitosisImport[];
  meta: JSONObject & {
    useMetadata?: JSONObject;
    // TO-DO: remove this? seems to be legacy/outdated, and superseeded by `useMetadata`
    metadataHook?: JSONObject;
  };
  inputs: MitosisComponentInput[];
  state: JSONObject;
  context: {
    get: { [key: string]: ContextInfo };
    set: { [key: string]: { name: string; value?: JSONObject } }; // TODO: support non object values
  };
  hooks: {
    init?: extendedHook;
    onMount?: extendedHook;
    onUnMount?: extendedHook;
    preComponent?: extendedHook;
    postComponent?: extendedHook;
    onUpdate?: extendedHook;
  };
  children: MitosisNode[];
  subComponents: MitosisComponent[];
};
