import { flow } from 'fp-ts/lib/function';
import { extendedHook, MitosisComponent } from '../../../types/mitosis-component';
import { MitosisNode } from '../../../types/mitosis-node';
import { Plugin } from '../../../types/plugins';
import { checkIsDefined } from '../../nullable';
import { traverseNodes } from '../../traverse-nodes';
import { CodeProcessor } from './types';

/**
 * Process code in each node.
 */
const preProcessNodeCode = ({
  json,
  codeProcessor,
  parentComponent,
}: {
  json: MitosisNode;
  codeProcessor: CodeProcessor;
  parentComponent: MitosisComponent;
}) => {
  // const propertiesProcessor = codeProcessor('properties');
  // for (const key in json.properties) {
  //   const value = json.properties[key];
  //   if (key !== '_text' && value) {
  //     json.properties[key] = propertiesProcessor(value);
  //   }
  // }

  const bindingsProcessor = codeProcessor('bindings', parentComponent);
  for (const key in json.bindings) {
    const value = json.bindings[key];
    if (value?.code) {
      value.code = bindingsProcessor(value.code, key);
    }
  }

  json.name = codeProcessor('dynamic-jsx-elements', parentComponent)(json.name, '');
};

export const createCodeProcessorPlugin =
  (codeProcessor: CodeProcessor) =>
  (json: MitosisComponent): void => {
    function processHook(key: keyof typeof json.hooks, hook: extendedHook) {
      hook.code = codeProcessor('hooks', json)(hook.code, key);
      if (hook.deps) {
        hook.deps = codeProcessor('hooks-deps', json)(hook.deps, key);
      }
    }

    /**
     * process code in hooks
     */
    for (const key in json.hooks) {
      const typedKey = key as keyof typeof json.hooks;
      const hooks = json.hooks[typedKey];

      if (checkIsDefined(hooks)) {
        if (Array.isArray(hooks)) {
          for (const hook of hooks) {
            processHook(typedKey, hook);
          }
        } else {
          processHook(typedKey, hooks);
        }
      }
    }

    for (const key in json.state) {
      const state = json.state[key];
      if (state) {
        state.code = codeProcessor('state', json)(state.code, key);

        if (state.typeParameter) {
          state.typeParameter = codeProcessor('types', json)(state.typeParameter, key);
        }
      }
    }

    for (const key in json.context.set) {
      const set = json.context.set[key];
      if (set.ref) {
        set.ref = codeProcessor('context-set', json)(set.ref, key);
      }
      if (set.value) {
        for (const key in set.value) {
          const value = set.value[key];
          if (value) {
            value.code = codeProcessor('context-set', json)(value.code, key);
          }
        }
      }
    }

    traverseNodes(json, (node) => {
      preProcessNodeCode({ json: node, codeProcessor, parentComponent: json });
    });

    if (json.types) {
      json.types = json.types?.map((type) => codeProcessor('types', json)(type, ''));
    }

    if (json.propsTypeRef) {
      json.propsTypeRef = codeProcessor('types', json)(json.propsTypeRef, '');
    }
  };

/**
 * Given a `codeProcessor` function, processes all code expressions within a Mitosis component.
 */
export const CODE_PROCESSOR_PLUGIN = flow(
  createCodeProcessorPlugin,
  (plugin): Plugin =>
    () => ({ json: { post: plugin } }),
);
