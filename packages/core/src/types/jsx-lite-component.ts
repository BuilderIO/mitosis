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
    [key: string]: string;
  };
}

export type JSXLiteComponent = {
  '@type': '@jsx-lite/component';
  imports: JSXLiteImport[];
  state: { [key: string]: JSON };
  children: JSXLiteNode[];
};
