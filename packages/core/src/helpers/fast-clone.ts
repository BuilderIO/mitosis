export const fastClone = <T extends object>(obj: T): T =>
  JSON.parse(JSON.stringify(obj));
