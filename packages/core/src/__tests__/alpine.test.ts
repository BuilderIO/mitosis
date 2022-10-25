import { componentToAlpine, ToAlpineOptions } from '../generators/alpine';
import { runTestsForTarget } from './shared';

describe('Alpine.js', () => {
  const possibleOptions: ToAlpineOptions[] = [
    {},
    // { inlineState: true },
    // { useShorthandSyntax: true },
    // { inlineState: true, useShorthandSyntax: true },
  ]
  possibleOptions.map(options => runTestsForTarget({ options, target: 'alpine', generator: componentToAlpine }));
});
