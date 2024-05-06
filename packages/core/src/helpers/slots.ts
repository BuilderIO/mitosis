import { types } from '@babel/core';
import { pipe } from 'fp-ts/function';
import { kebabCase } from 'lodash';
import { babelTransformExpression } from './babel-transform';

const SLOT_PREFIX = 'slot';
export type SlotMapper = (slotName: string) => string;

export const isSlotProperty = (key: string, slotPrefix: string = SLOT_PREFIX): boolean =>
  key.startsWith(slotPrefix);

export const stripSlotPrefix = (key: string, slotPrefix: string = SLOT_PREFIX): string =>
  isSlotProperty(key, slotPrefix) ? key.substring(slotPrefix.length) : key;

export const toKebabSlot = (key: string, slotPrefix: string = SLOT_PREFIX): string =>
  pipe(stripSlotPrefix(key, slotPrefix), kebabCase);

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
