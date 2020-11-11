export type LocalStorageGetOptions = {
  suppressWarning?: boolean;
};

export const localStorageGet = (
  key: string,
  options: LocalStorageGetOptions = {},
): any => {
  try {
    return JSON.parse(localStorage.get(key));
  } catch (err) {
    if (!options.suppressWarning) {
      console.warn('Could not get from localStorage', err);
    }
  }
};
