import { MitosisComponent } from '@/types/mitosis-component';
import * as babel from '@babel/core';
import { Project } from 'ts-morph';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
  tsProject?: {
    project: Project;
  };
  filePath?: string;
};

export type Context = {
  // Babel has other context
  cwd?: string;
  builder: {
    component: MitosisComponent;
    keepStatements?: babel.types.Statement[];
  };
};
