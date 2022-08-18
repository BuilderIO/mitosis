import x from './01-one-component';
import y from './02-two-components';
import z from './03-types';

const TEST_APP_PATHS = {
  OneComp: './01-one-component',
  TwoComps: './02-two-components',
  Types: './03-types',
};

export const getTestApp = () => {
  switch (window.location.pathname) {
    case TEST_APP_PATHS.OneComp:
      return x;
    case TEST_APP_PATHS.TwoComps:
      return y;
    case TEST_APP_PATHS.Types:
      return z;
  }
};
