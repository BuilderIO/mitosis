import traverse from 'traverse';
import * as babel from '@babel/core';

import { JSXLiteComponent } from '../types/jsx-lite-component';
import { getRefs } from './get-refs';
import { isJsxLiteNode } from './is-jsx-lite-node';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { babelTransformExpression } from './babel-transform';

const tsPreset = require('@babel/preset-typescript');

export type RefMapper = (refName: string) => string;

const replaceRefsInString = (
  code: string,
  refs: string[],
  mapper: RefMapper,
) => {
  return babelTransformExpression(code, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const name = path.node.name;
      const isRef = refs.includes(name);
      if (isRef) {
        path.replaceWith(babel.types.identifier(mapper(name)));
      }
    },
  });
};

export const mapRefs = (
  component: JSXLiteComponent,
  mapper: RefMapper,
): void => {
  const refs = Array.from(getRefs(component));

  for (const key of Object.keys(component.state)) {
    const value = component.state[key];
    if (typeof value === 'string') {
      if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGet = Boolean(methodValue.match(/^get /));
        const isSet = Boolean(methodValue.match(/^set /));
        component.state[key] =
          methodLiteralPrefix +
          replaceRefsInString(
            methodValue.replace(/^(get |set )?/, 'function '),
            refs,
            mapper,
          ).replace(/^function /, isGet ? 'get ' : isSet ? 'set ' : '');
      } else if (value.startsWith(functionLiteralPrefix)) {
        component.state[key] =
          functionLiteralPrefix +
          replaceRefsInString(
            value.replace(functionLiteralPrefix, ''),
            refs,
            mapper,
          );
      }
    }
  }

  traverse(component).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      for (const key of Object.keys(item.bindings)) {
        const value = item.bindings[key];
        if (typeof value === 'string' && key !== 'ref') {
          item.bindings[key] = replaceRefsInString(value, refs, mapper);
        }
      }
    }
  });

  for (const key of Object.keys(
    component.hooks,
  ) as (keyof typeof component.hooks)[]) {
    const hookCode = component.hooks[key];
    if (hookCode) {
      component.hooks[key] = replaceRefsInString(hookCode, refs, mapper);
    }
  }
};
