import * as babel from '@babel/core';
import generate from '@babel/generator';
import { HOOKS } from '../../../constants/hooks';
import { targets } from '../../../targets';
import { MitosisComponent, TargetBlockCode } from '../../../types/mitosis-component';

const { types } = babel;

export const getTargetId = (component: MitosisComponent) => {
  const latestId = Object.keys(component.targetBlocks || {}).length;
  const blockId = (latestId + 1).toString();
  return blockId;
};

export const getMagicString = (targetId: string) => [USE_TARGET_MAGIC_STRING, targetId].join('');

export const USE_TARGET_MAGIC_STRING = 'USE_TARGET_BLOCK_';
// check for uuid.v4() format
const idRegex = /\d*/;

const REGEX_BLOCK_NAME = 'blockId';

export const USE_TARGET_MAGIC_REGEX = new RegExp(
  // make sure to capture the id of the target block
  `["']${USE_TARGET_MAGIC_STRING}\(?<${REGEX_BLOCK_NAME}>${idRegex.source}\)["']`,
  'g',
);

export const getIdFromMatch = (match: string) => {
  const USE_TARGET_MAGIC_REGEX_WITHOUT_G = new RegExp(
    `["']${USE_TARGET_MAGIC_STRING}\(?<${REGEX_BLOCK_NAME}>${idRegex.source}\)["']`,
  );
  const result = match.match(USE_TARGET_MAGIC_REGEX_WITHOUT_G);
  if (!result) return undefined;
  return result.groups?.[REGEX_BLOCK_NAME];
};

/**
 * This function finds `useTarget()` and converts it our JSON representation
 */
export const getUseTargetStatements = (
  useTargetHook: babel.types.CallExpression,
): TargetBlockCode | undefined => {
  if (!types.isIdentifier(useTargetHook.callee)) return undefined;
  if (useTargetHook.callee.name !== HOOKS.TARGET) return undefined;

  const obj = useTargetHook.arguments[0];

  if (!types.isObjectExpression(obj)) return undefined;

  const targetBlock: TargetBlockCode = {};

  obj.properties.forEach((prop) => {
    if (!types.isObjectProperty(prop)) {
      throw new Error('useTarget properties cannot be spread or references');
    }
    if (!types.isIdentifier(prop.key)) {
      throw new Error('Expected an identifier, instead got: ' + prop.key);
    }

    if (!Object.keys(targets).concat('default').includes(prop.key.name)) {
      throw new Error('Invalid target: ' + prop.key.name);
    }

    const targetCode = prop.value;
    if (!types.isExpression(targetCode)) return undefined;

    targetBlock[prop.key.name as unknown as 'default'] = {
      code: generate(targetCode).code,
    };
  });

  return Object.keys(targetBlock).length ? targetBlock : undefined;
};
