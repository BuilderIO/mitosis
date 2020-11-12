export type LocalStorageSetOptions = {
  suppressWarning?: boolean;
};

export const localStorageSet = (
  key: string,
  value: any,
  options: LocalStorageSetOptions = {},
): any => {
  try {
    return localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (!options.suppressWarning) {
      console.warn('Could not set from localStorage', err);
    }
  }
};
