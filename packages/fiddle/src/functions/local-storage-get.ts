export type LocalStorageGetOptions = {
  suppressWarning?: boolean;
};

export const localStorageGet = (key: string, options: LocalStorageGetOptions = {}): any => {
  try {
    const val = localStorage.getItem(key);
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  } catch (err) {
    if (!options.suppressWarning) {
      console.warn('Could not get from localStorage', err);
    }
  }
};
