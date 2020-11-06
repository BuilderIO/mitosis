export const fastClone = <T extends object>(object: T): T => JSON.parse(JSON.stringify(object));
