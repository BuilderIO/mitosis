import { Plugin } from '../../types/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { checkIsDefined } from '../nullable';
import { tarverseNodes } from '../traverse-nodes';

type CodeType = 'hooks' | 'hooks-deps' | 'bindings' | 'properties' | 'state';

type CodeProcessor = (codeType: CodeType) => (code: string) => string;

/**
 * Process code in bindings and properties of a node
 */
const preProcessBlockCode = ({
  json,
  codeProcessor,
}: {
  json: MitosisNode;
  codeProcessor: CodeProcessor;
}) => {
  const propertiesProcessor = codeProcessor('properties');
  for (const key in json.properties) {
    const value = json.properties[key];
    if (value) {
      json.properties[key] = propertiesProcessor(value);
    }
  }

  const bindingsProcessor = codeProcessor('bindings');
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
      post: (json: MitosisComponent) => {
        const processHookCode = codeProcessor('hooks');

        /**
         * process code in hooks
         */
        for (const key in json.hooks) {
          const typedKey = key as keyof typeof json.hooks;
          const hooks = json.hooks[typedKey];

          if (checkIsDefined(hooks) && Array.isArray(hooks)) {
            for (const hook of hooks) {
              hook.code = processHookCode(hook.code);
              if (hook.deps) {
                hook.deps = codeProcessor('hooks-deps')(hook.deps);
              }
            }
          } else if (checkIsDefined(hooks)) {
            hooks.code = processHookCode(hooks.code);
            if (hooks.deps) {
              hooks.deps = codeProcessor('hooks-deps')(hooks.deps);
            }
          }
        }

        for (const key in json.state) {
          const state = json.state[key];
          if (state && state.type !== 'property') {
            state.code = codeProcessor('state')(state.code);
          }
        }

        tarverseNodes(json, (node) => {
          preProcessBlockCode({ json: node, codeProcessor });
        });
      },
    },
  });
