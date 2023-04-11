import { types } from '@babel/core';
import { babelTransformExpression } from './babel-transform';

const SLOT_PREFIX = 'slot';
export type SlotMapper = (slotName: string) => string;

export const isSlotProperty = (key: string, slotPrefix: string = SLOT_PREFIX): boolean =>
  key.startsWith(slotPrefix);

export const stripSlotPrefix = (key: string, slotPrefix: string = SLOT_PREFIX): string =>
  isSlotProperty(key, slotPrefix) ? key.substring(slotPrefix.length) : key;

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

export function addSlotName(code: string, slotAttribute: string) {
  // If the tag has other attributes, add the "slot" attribute before the first attribute
  // If the tag has no attributes, add the "slot" attribute after the tag name
  let splitIndex = code.indexOf('>');
  const whitespaceIndex = code.indexOf(' ');
  if (whitespaceIndex > -1 && whitespaceIndex < splitIndex) {
    splitIndex = whitespaceIndex;
  }
  return `${code.slice(0, splitIndex)} ${slotAttribute}${code.slice(splitIndex)}`;
}
