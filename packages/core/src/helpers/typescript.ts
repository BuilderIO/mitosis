export type Overwrite<T, U> = keyof U extends keyof T
  ? Pick<T, Exclude<keyof T, keyof U>> & U
  : never;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type OmitObj<T, U> = T extends U ? Omit<T, keyof U> : never;

export type Dictionary<T> = { [key: string]: T };

export const objectHasKey = <T>(object: T, key: PropertyKey): key is keyof T =>
  key in (object as any);

export const isTypescriptFile = (fileName: string): boolean =>
  fileName.endsWith('.ts') || fileName.endsWith('.tsx');
