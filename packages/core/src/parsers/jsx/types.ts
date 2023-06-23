import { Project, Symbol } from 'ts-morph';
import { MitosisComponent } from '../../types/mitosis-component';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
  /**
   * Path to your project's `tsconfig.json` file. Needed for advanced types parsing (e.g. signals).
   */
  tsConfigFilePath?: string;
  tsProject?: {
    project: Project;
    signalSymbol: Symbol;
  };
  filePath?: string;
};

export type Context = {
  // Babel has other context
  builder: {
    component: MitosisComponent;
  };
};
