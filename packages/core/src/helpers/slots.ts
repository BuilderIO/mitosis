const SLOT_PREFIX = 'slot';

export const isSlotProperty = (key: string): boolean => key.startsWith(SLOT_PREFIX);

export const stripSlotPrefix = (key: string): string => key.substring(SLOT_PREFIX.length);
