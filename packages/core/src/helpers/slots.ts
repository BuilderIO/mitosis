import { types } from '@babel/core';
import { babelTransformExpression } from './babel-transform';

const SLOT_PREFIX = 'slot';
export type SlotMapper = (slotName: string) => string;

export const isSlotProperty = (key: string, slotPrefix: string = SLOT_PREFIX): boolean =>
  key.startsWith(slotPrefix);

export const stripSlotPrefix = (key: string, slotPrefix: string = SLOT_PREFIX): string =>
  isSlotProperty(key, slotPrefix) ? convertToKebabCase(key.substring(slotPrefix.length)) : convertToKebabCase(key);

export function replaceSlotsInString(code: string, mapper: SlotMapper) {
  return babelTransformExpression(code, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const name = path.node.name;
      const isSlot = isSlotProperty(name);
      if (isSlot) {
        path.replaceWith(types.identifier(mapper(stripSlotPrefix(name).toLowerCase())));
      }
    },
  });
}

function convertToKebabCase(key: string) {
  var formattedString = key.replace(/([A-Z])/g, '-$1').trim();
  return formattedString;
}
