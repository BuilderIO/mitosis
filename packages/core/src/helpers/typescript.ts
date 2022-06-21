export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OmitObj<T, U> = U extends T ? Omit<T, keyof U> : never;
