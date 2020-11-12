import { observable } from 'mobx';
import { breakpoints } from './breakpoints';

export const device = observable({
  width: window.innerWidth,
  get small() {
    return device.width < breakpoints.sizes.small;
  },
});

window.addEventListener(
  'resize',
  () => {
    device.width = window.innerWidth;
  },
  { passive: true },
);
