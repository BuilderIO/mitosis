export type Nullable<X> = X | null | undefined;

export const checkIsDefined = <T>(value: Nullable<T>): value is NonNullable<T> =>
  value !== null && value !== undefined;
