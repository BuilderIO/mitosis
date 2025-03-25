import type { NodePath } from '@babel/core';
import { types } from '@babel/core';
import traverse from 'neotraverse/legacy';

import { MitosisComponent } from '@/types/mitosis-component';
import { babelTransformExpression } from './babel-transform';
import { getRefs } from './get-refs';
import { isMitosisNode } from './is-mitosis-node';
import { SETTER } from './patterns';

export type RefMapperType = 'deps' | 'deps-array';
export type RefMapper = (
  refName: string,
  extra?: {
    type?: RefMapperType;
    path: NodePath<types.Identifier>;
  },
) => string;

const replaceRefsInString = (
  code: string,
  refs: string[],
  mapper: RefMapper,
  type?: RefMapperType,
) => {
  return babelTransformExpression(code, {
    Identifier(path: NodePath<types.Identifier>) {
      const name = path.node.name;
      const isRef = refs.includes(name);
      if (isRef) {
        path.replaceWith(
          types.identifier(
            mapper(name, {
              type,
              path,
            }),
          ),
        );
      }
    },
  });
};

export const mapRefs = (component: MitosisComponent, mapper: RefMapper): void => {
  const refSet = getRefs(component);

  // grab refs not used for bindings
  Object.keys(component.refs).forEach((ref) => refSet.add(ref));
  const refs = Array.from(refSet);

  for (const key of Object.keys(component.state)) {
    const stateVal = component.state[key];

    if (typeof stateVal?.code === 'string') {
      const value = stateVal.code;
      switch (stateVal.type) {
        case 'method':
        case 'getter':
          const isGet = stateVal.type === 'getter';
          const isSet = Boolean(value.match(SETTER));
          component.state[key] = {
            ...stateVal,
            code: replaceRefsInString(
              value.replace(/^(get |set )?/, 'function '),
              refs,
              mapper,
            ).replace(/^function /, isGet ? 'get ' : isSet ? 'set ' : ''),
          };
          break;
        case 'function':
          component.state[key] = {
            ...stateVal,
            code: replaceRefsInString(value, refs, mapper),
            type: 'function',
          };
          break;
        default:
          break;
      }
    }
  }

  traverse(component).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key of Object.keys(item.bindings)) {
        const value = item.bindings[key];
        if (typeof value === 'object' && key !== 'ref') {
          item.bindings[key] = {
            ...value,
            code: replaceRefsInString(value.code as string, refs, mapper),
          };
        }
      }
    }
  });

  for (const key of Object.keys(component.hooks) as (keyof typeof component.hooks)[]) {
    const _hook = component.hooks[key];

    const hooks = Array.isArray(_hook) ? _hook : [_hook];
    for (const hook of hooks) {
      if (!hook) continue;
      if (hook.code) {
        hook.code = replaceRefsInString(hook.code, refs, mapper);
      }

      if (hook.deps) {
        hook.deps = replaceRefsInString(hook.deps, refs, mapper, 'deps');
      }
      if (hook?.depsArray) {
        hook.depsArray = hook.depsArray.map((dep) =>
          replaceRefsInString(dep, refs, mapper, 'deps-array'),
        );
      }
    }
  }
};
