import type { Target } from '@/types/config';
import * as babel from '@babel/core';
import generate from '@babel/generator';
import { MitosisComponent, TargetBlockDefinition } from '../../../types/mitosis-component';

const TARGETS: Record<Target, null> = {
  alpine: null,
  angular: null,
  customElement: null,
  html: null,
  mitosis: null,
  liquid: null,
  react: null,
  reactNative: null,
  solid: null,
  svelte: null,
  swift: null,
  template: null,
  webcomponent: null,
  vue: null,
  stencil: null,
  qwik: null,
  marko: null,
  preact: null,
  lit: null,
  rsc: null,
  taro: null,
};

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
export const getUseTargetStatements = (path: babel.NodePath<babel.types.CallExpression>) => {
  const useTargetHook = path.node;
  const obj = useTargetHook.arguments[0];

  if (!types.isObjectExpression(obj)) return undefined;

  const isInlinedCodeInsideFunctionBody =
    types.isExpressionStatement(path.parent) && types.isBlockStatement(path.parentPath.parent);

  const targetBlock: TargetBlockDefinition = {
    settings: {
      requiresDefault: !isInlinedCodeInsideFunctionBody,
    },
  };

  obj.properties.forEach((prop) => {
    if (!types.isObjectProperty(prop)) {
      throw new Error('ERROR Parsing `useTarget()`: properties cannot be spread or references');
    }
    if (!types.isIdentifier(prop.key)) {
      throw new Error(
        'ERROR Parsing `useTarget()`: Expected an identifier, instead got: ' + prop.key,
      );
    }

    if (!Object.keys(TARGETS).concat('default').includes(prop.key.name)) {
      throw new Error('ERROR Parsing `useTarget()`: Invalid target: ' + prop.key.name);
    }
    const keyName = prop.key.name as unknown as 'default';

    const targetCode = prop.value;

    if (isInlinedCodeInsideFunctionBody) {
      if (!(types.isArrowFunctionExpression(targetCode) || types.isFunctionExpression(targetCode)))
        return undefined;
      const body = targetCode.body;
      if (types.isBlockStatement(body)) {
        let code = '';
        body.body.forEach((statement) => {
          code += generate(statement).code + '\n';
        });
        targetBlock[keyName] = {
          code,
        };
      } else {
        targetBlock[keyName] = {
          code: generate(body).code,
        };
      }
    } else {
      if (!types.isExpression(targetCode)) return undefined;
      targetBlock[keyName] = {
        code: generate(targetCode).code,
      };
    }
  });

  return Object.keys(targetBlock).length ? targetBlock : undefined;
};
