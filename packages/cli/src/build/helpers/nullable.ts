export type Nullable<T> = T | null | undefined;

export const checkIsDefined = <T>(maybeT: Nullable<T>): maybeT is T =>
  maybeT !== null && maybeT !== undefined;
