import { JSON, JSONObject } from './json';
import { JSXLiteNode } from './jsx-lite-node';

/**
 * @example
 *  // import core, { useState, someThing as someAlias } from '@jsx-lite/core'
 *  {
 *    path: '@jsx-lite/core',
 *    imports: {
 *      useState: 'useState',
 *      someAlias: 'someThing',
 *      core: 'default',
 *    }
 *  }
 *
 * @example
 *  // import * as core from '@jsx-lite/core'
 *  {
 *    path: '@jsx-lite/core',
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
  '@type': '@jsx-lite/component';
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
