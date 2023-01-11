export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OmitObj<T, U> = T extends U ? Omit<T, keyof U> : never;

export type Dictionary<T> = { [key: string]: T };

export const objectHasKey = <T>(object: T, key: PropertyKey): key is keyof T => key in object;
