import { MitosisComponent } from '../../types/mitosis-component';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
  /**
   * Path to your project's `tsconfig.json` file. Needed for advanced types parsing (e.g. signals).
   */
  tsConfigFilePath?: string;
};

export type Context = {
  // Babel has other context
  builder: {
    component: MitosisComponent;
  };
};
