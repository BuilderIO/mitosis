import { observable } from 'mobx';
import { theme } from './theme';

export const colors = observable({
  get primary() {
    return theme.darkMode ? 'rgb(84, 203, 255)' : 'rgba(28, 151, 204, 1)';
  },
  get contrast() {
    return theme.darkMode ? '#444' : '#ddd';
  },
  get background() {
    return theme.darkMode ? '#1e1e1e' : '#f8f8f8';
  },
});
