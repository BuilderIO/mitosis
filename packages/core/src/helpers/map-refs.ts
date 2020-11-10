import traverse from 'traverse';
import babel from '@babel/core';

import { JSXLiteComponent } from '../types/jsx-lite-component';
import { getRefs } from './get-refs';
import { isJsxLiteNode } from './is-jsx-lite-node';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';

export type RefMapper = (refName: string) => string;

const replaceRefsInString = (
  code: string,
  refs: string[],
  mapper: RefMapper,
) => {
  return babel.transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          Identifier(path: babel.NodePath<babel.types.Identifier>) {
            const name = path.node.name;
            const isRef = refs.includes(name);
            if (isRef) {
              path.replaceWith(babel.types.identifier(mapper(name)));
            }
          },
        },
      }),
    ],
  })!.code!;
};

export const mapRefs = (json: JSXLiteComponent, mapper: RefMapper) => {
  const refs = Array.from(getRefs(json));

  for (const key in json.state) {
    const value = json.state[key];
    if (typeof value === 'string') {
      if (value.startsWith(methodLiteralPrefix)) {
        json.state[key] =
          methodLiteralPrefix +
          replaceRefsInString(
            value.replace(methodLiteralPrefix, ''),
            refs,
            mapper,
          );
      } else if (value.startsWith(functionLiteralPrefix)) {
        json.state[key] =
          functionLiteralPrefix +
          replaceRefsInString(
            value.replace(functionLiteralPrefix, ''),
            refs,
            mapper,
          );
      }
    }
  }

  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key];
        if (typeof value === 'string') {
          item.bindings[key] = replaceRefsInString(value, refs, mapper);
        }
      }
    }
  });
};
