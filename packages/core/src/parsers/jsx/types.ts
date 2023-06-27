import { Project, Symbol } from 'ts-morph';
import { MitosisComponent } from '../../types/mitosis-component';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
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
