import { JSON, JSONObject } from './json';
import { JSXLiteNode } from './mitosis-node';

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
export interface JSXLiteImport {
  path: string;
  imports: {
    [key: string]: string | undefined;
  };
}

type ContextInfo = { name: string; path: string };

export type JSXLiteComponent = {
  '@type': '@builder.io/mitosis/component';
  name: string;
  imports: JSXLiteImport[];
  meta: JSONObject & {
    metadataHook?: JSONObject;
  };
  state: JSONObject;
  context: {
    get: { [key: string]: ContextInfo };
    set: { [key: string]: { name: string; value?: JSONObject } }; // TODO: support non object values
  };
  hooks: {
    init?: string;
    onMount?: string;
    onUnMount?: string;
    preComponent?: string;
    postComponent?: string;
  };
  children: JSXLiteNode[];
  subComponents: JSXLiteComponent[];
};
