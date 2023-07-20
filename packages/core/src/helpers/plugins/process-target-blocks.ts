import {
  getIdFromMatch,
  USE_TARGET_MAGIC_REGEX,
  USE_TARGET_MAGIC_STRING,
} from '../../parsers/jsx/hooks/use-target';
import { Targets } from '../../targets';
import { MitosisComponent } from '../../types/mitosis-component';
import { Plugin } from '../../types/plugins';
import { createCodeProcessorPlugin } from './process-code';

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
 * Processes `useTarget()` blocks for a given target.
 */
export const processTargetBlocks = (target: Targets): Plugin => {
  const plugin = createCodeProcessorPlugin(
    (codeType, json, node) => (code, key) => {
      if (codeType === 'properties') {
        const matches = code.includes(USE_TARGET_MAGIC_STRING);
        const property = node?.properties[key];
        if (!matches || !property) return code;

        node.bindings[key] = {
          code: '"' + property + '"',
          type: 'single',
        };

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
        const targetBlock = getBlockForTarget({ target, json, targetId });

        if (!targetBlock) {
          throw new Error(
            `Could not find \`useTarget()\` value in "${json.name}" for target "${target}", and no default value was set.`,
          );
        }

        code = code.replaceAll(m, targetBlock.code);
      }

      return code;
    },
    { processProperties: true },
  );

  return () => ({ json: { pre: plugin } });
};
