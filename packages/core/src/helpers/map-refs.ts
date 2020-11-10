import traverse from 'traverse';
import * as babel from '@babel/core';

import { JSXLiteComponent } from '../types/jsx-lite-component';
import { getRefs } from './get-refs';
import { isJsxLiteNode } from './is-jsx-lite-node';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';

const tsPreset = require('@babel/preset-typescript');

export type RefMapper = (refName: string) => string;

const replaceRefsInString = (
  code: string,
  refs: string[],
  mapper: RefMapper,
) => {
  return babel
    .transformSync(`let _ = ${code}`, {
      presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
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
    })!
    .code!.replace(/;$/, '')
    .replace(/^let _ = /, '');
};

export const mapRefs = (json: JSXLiteComponent, mapper: RefMapper) => {
  const refs = Array.from(getRefs(json));

  for (const key in json.state) {
    const value = json.state[key];
    if (typeof value === 'string') {
      if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGet = Boolean(methodValue.match(/^get /));
        const isSet = Boolean(methodValue.match(/^set /));
        json.state[key] =
          methodLiteralPrefix +
          replaceRefsInString(
            methodValue.replace(/^(get |set )?/, 'function '),
            refs,
            mapper,
          ).replace(/^function /, isGet ? 'get ' : isSet ? 'set ' : '');
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
        if (typeof value === 'string' && key !== 'ref') {
          item.bindings[key] = replaceRefsInString(value, refs, mapper);
        }
      }
    }
  });
};
