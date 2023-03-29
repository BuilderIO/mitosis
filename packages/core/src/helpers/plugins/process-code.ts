import { Plugin } from '../../types/plugins';
import { extendedHook, MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { checkIsDefined } from '../nullable';
import { traverseNodes } from '../traverse-nodes';

type CodeType = 'hooks' | 'hooks-deps' | 'bindings' | 'properties' | 'state';

declare function codeProcessor(
  codeType: CodeType,
  json: MitosisComponent,
): (code: string, hookType?: keyof MitosisComponent['hooks']) => string;

type CodeProcessor = typeof codeProcessor;

/**
 * Process code in bindings and properties of a node
 */
const preProcessBlockCode = ({
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
      value.code = bindingsProcessor(value.code);
    }
  }
};

/**
 * Given a `codeProcessor` function, processes all code expressions within a Mitosis component.
 */
export const CODE_PROCESSOR_PLUGIN =
  (codeProcessor: CodeProcessor): Plugin =>
  () => ({
    json: {
      post: (json) => {
        function processHook(key: keyof typeof json.hooks, hook: extendedHook) {
          hook.code = codeProcessor('hooks', json)(hook.code, key);
          if (hook.deps) {
            hook.deps = codeProcessor('hooks-deps', json)(hook.deps);
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
            state.code = codeProcessor('state', json)(state.code);
          }
        }

        traverseNodes(json, (node) => {
          preProcessBlockCode({ json: node, codeProcessor, parentComponent: json });
        });
      },
    },
  });
