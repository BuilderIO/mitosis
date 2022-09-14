import { MitosisComponent } from '../../types/mitosis-component';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
};

export type Context = {
  // Babel has other context
  builder: {
    component: MitosisComponent;
  };
};
