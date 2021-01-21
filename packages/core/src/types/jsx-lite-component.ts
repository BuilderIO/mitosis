import { JSON } from './json';
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

export type JSXLiteComponent = {
  '@type': '@jsx-lite/component';
  name: string;
  imports: JSXLiteImport[];
  meta: { [key: string]: JSON | undefined };
  state: { [key: string]: JSON | undefined };
  hooks: {
    init?: string;
    onMount?: string;
    onUnMount?: string;
    preComponent?: string;
    postComponent?: string;
  };
  children: JSXLiteNode[];
};
