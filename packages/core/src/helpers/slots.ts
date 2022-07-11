const SLOT_PREFIX = 'slot';

export const isSlotProperty = (key: string): boolean => key.startsWith(SLOT_PREFIX);
