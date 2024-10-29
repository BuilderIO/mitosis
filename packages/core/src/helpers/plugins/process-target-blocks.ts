import {
  getIdFromMatch,
  USE_TARGET_MAGIC_REGEX,
  USE_TARGET_MAGIC_STRING,
} from '../../parsers/jsx/hooks/use-target';
import { Targets } from '../../targets';
import { TargetBlockDefinition } from '../../types/mitosis-component';
import { Plugin } from '../../types/plugins';
import { createSingleBinding } from '../bindings';
import { createCodeProcessorPlugin } from './process-code';

const getBlockForTarget = ({
  target,
  targetBlock,
}: {
  target: Targets;
  targetBlock: TargetBlockDefinition;
}) => {
  switch (target) {
    default:
      return targetBlock[target] || targetBlock['default'];
  }
};

/**
 * Processes `useTarget()` blocks for a given target.
 */
export const processTargetBlocks = (target: Targets): Plugin => {
  const plugin = createCodeProcessorPlugin(
    (codeType, json, node) => (code, key) => {
      if (codeType === 'properties') {
        const matches = code.includes(USE_TARGET_MAGIC_STRING);
        const property = node?.properties[key];
        if (!matches || !property) return code;

        node.bindings[key] = createSingleBinding({ code: `"${property}"` });

        return () => {
          delete node.properties[key];
        };
      }

      const matches = code.match(USE_TARGET_MAGIC_REGEX);

      if (!matches) return code;
      for (const m of matches) {
        // get the captured ID of the target block
        const targetId = getIdFromMatch(m);

        if (!targetId) continue;

        // find the target block in the component, or the default target block
        const targetBlock = json.targetBlocks?.[targetId];

        if (!targetBlock) {
          throw new Error(`Could not find \`useTarget()\` value in "${json.name}".`);
        }

        const block = getBlockForTarget({ target, targetBlock });

        if (!block) {
          if (targetBlock.settings.requiresDefault) {
            throw new Error(
              `Could not find \`useTarget()\` value in "${json.name}" for target "${target}", and no default value was set.`,
            );
          } else {
            // if we don't need a default, then that means we allow for nothing to be injected, e.g. when we are in a function body.
            code = code.replaceAll(m, '');
            continue;
          }
        }

        code = code.replaceAll(m, block.code);
      }

      return code;
    },
    { processProperties: true },
  );

  return () => ({ json: { pre: plugin } });
};
