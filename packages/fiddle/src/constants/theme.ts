import { observable, reaction } from 'mobx';
import { localStorageGet } from '../functions/local-storage-get';
import { localStorageSet } from '../functions/local-storage-set';

export const theme = observable({
  darkMode: localStorageGet('darkMode') ?? false,
});

reaction(
  () => theme.darkMode,
  (darkMode) => localStorageSet('darkMode', darkMode),
);
