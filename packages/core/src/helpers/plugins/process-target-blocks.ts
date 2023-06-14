import { MitosisComponent } from 'src/types/mitosis-component';
import { USE_TARGET_MAGIC_REGEX, getIdFromMatch } from '../../parsers/jsx/hooks/use-target';
import { Targets } from '../../targets';
import { Plugin } from '../../types/plugins';
import { CODE_PROCESSOR_PLUGIN } from './process-code';

const getBlockForTarget = ({
  target,
  json,
  targetId,
}: {
  target: Targets;
  json: MitosisComponent;
  targetId: string;
}) => {
  const targetBlock = json.targetBlocks?.[targetId];
  if (!targetBlock) return undefined;

  switch (target) {
    case 'vue3':
    case 'vue':
      return targetBlock['vue3'] || targetBlock['vue'] || targetBlock['default'];
    default:
      return targetBlock[target] || targetBlock['default'];
  }
};

/**
 * Given a `codeProcessor` function, processes all code expressions within a Mitosis component.
 */
export const processTargetBlocks = (target: Targets): Plugin =>
  CODE_PROCESSOR_PLUGIN((_codeType, json) => {
    return (code) => {
      // find any instance of `$$USE_TARGET$$` followed by a uuid, and replace it with the actual target code.
      const matches = code.match(USE_TARGET_MAGIC_REGEX);

      if (!matches) return code;
      for (const m of matches) {
        // get the captured ID of the target block
        const targetId = getIdFromMatch(m);

        if (!targetId) continue;

        // find the target block in the component, or the default target block
        const targetBlock = getBlockForTarget({ target, json, targetId });

        console.log('targetBlock', { target, targetBlock });
        if (!targetBlock) continue;

        code = code.replace(m, targetBlock.code);
      }

      return code;
    };
  });
// () => ({
//   json: {
//     post: (json) => {

//       /**
//        * process code in hooks
//        */
//       for (const key in json.hooks) {
//         const typedKey = key as keyof typeof json.hooks;
//         const hooks = json.hooks[typedKey];

//         if (checkIsDefined(hooks)) {
//           if (Array.isArray(hooks)) {
//             for (const hook of hooks) {
//               processHook(typedKey, hook);
//             }
//           } else {
//             processHook(typedKey, hooks);
//           }
//         }
//       }

//       for (const key in json.state) {
//         const state = json.state[key];
//         if (state) {
//           state.code = codeProcessor('state', json)(state.code, key);
//         }
//       }

//       traverseNodes(json, (node) => {
//         preProcessNodeCode({ json: node, codeProcessor, parentComponent: json });
//       });
//     },
//   },
// });
