import { Plugin } from '../../types/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { tarverseNodes } from '../traverse-nodes';
import { checkIsDefined } from '../nullable';

type CodeProcessor = (codeType: 'hooks' | 'bindings' | 'propteries') => (code: string) => string;

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
  for (const key in json.properties) {
    const value = json.properties[key];
    if (value) {
      json.properties[key] = codeProcessor('propteries')(value);
    }
  }
  for (const key in json.bindings) {
    const value = json.bindings[key];
    if (value?.code) {
      json.bindings[key] = {
        arguments: value.arguments,
        code: codeProcessor('bindings')(value.code),
      };
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
      pre: (json: MitosisComponent) => {
        const processCode = codeProcessor('hooks');

        /**
         * process code in hooks
         */
        for (const key in json.hooks) {
          const typedKey = key as keyof typeof json.hooks;
          const hooks = json.hooks[typedKey];

          if (checkIsDefined(hooks) && Array.isArray(hooks)) {
            for (const hook of hooks) {
              hook.code = processCode(hook.code);
              if (hook.deps) {
                hook.deps = processCode(hook.deps);
              }
            }
          } else if (checkIsDefined(hooks)) {
            hooks.code = processCode(hooks.code);
            if (hooks.deps) {
              hooks.deps = processCode(hooks.deps);
            }
          }
        }

        tarverseNodes(json, (node) => {
          preProcessBlockCode({ json: node, codeProcessor });
        });
      },
    },
  });
