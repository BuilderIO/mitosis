const SLOT_PREFIX = 'slot';

export const isSlotProperty = (key: string): boolean => key.startsWith(SLOT_PREFIX);

export const stripSlotPrefix = (key: string): string => key.substring(SLOT_PREFIX.length);

export const propSlotsToTemplateSlots = (string: string) =>
  string.replace(/(slot)(\w+)/g, (_match, _g1, g2) => '$slots.' + g2.toLowerCase());
