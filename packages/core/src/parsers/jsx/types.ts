import { MitosisComponent } from '../../types/mitosis-component';

export type ParseMitosisOptions = {
  format: 'react' | 'simple';
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
};

export type Context = {
  // Babel has other context
  builder: {
    component: MitosisComponent;
  };
};
