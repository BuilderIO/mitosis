import * as babel from '@babel/core';
import generate from '@babel/generator';
import { targets } from 'src/targets';
import { TargetBlockCode } from 'src/types/mitosis-component';
import { v4 as uuid } from 'uuid';
import { HOOKS } from '../../../constants/hooks';

const { types } = babel;

export const getTargetId = (block: TargetBlockCode) => uuid();

export const getMagicString = (targetId: string) => [USE_TARGET_MAGIC_STRING, targetId].join('');

export const USE_TARGET_MAGIC_STRING = 'USE_TARGET_BLOCK_';
// check for uuid.v4() format
const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/;

const REGEX_BLOCK_NAME = 'blockId';

export const USE_TARGET_MAGIC_REGEX = new RegExp(
  // make sure to capture the id of the target block
  `"${USE_TARGET_MAGIC_STRING}\(?<${REGEX_BLOCK_NAME}>${uuidRegex.source}\)"`,
  'g',
);

export const getIdFromMatch = (match: string) => {
  const USE_TARGET_MAGIC_REGEX_WITHOUT_G = new RegExp(
    `"${USE_TARGET_MAGIC_STRING}\(?<${REGEX_BLOCK_NAME}>${uuidRegex.source}\)"`,
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

    // TO-DO: replace the useTarget() call with a magic string
    // this will be replaced with the actual target code later
  });

  return Object.keys(targetBlock).length ? targetBlock : undefined;
};
