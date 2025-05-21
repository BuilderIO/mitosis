import { MitosisComponent } from '@/types/mitosis-component';
import { Project } from 'ts-morph';

export type ParseMitosisOptions = {
  jsonHookNames?: string[];
  compileAwayPackages?: string[];
  typescript: boolean;
  tsProject?: {
    project: Project;
  };
  filePath?: string;

  /**
   * When `true`, the `blocksSlots` field on Mitosis Nodes will be used to transform
   * deeply nested JSX elements found on properties. Note that not every generator
   * supports parsing `blocksSlots`.
   * Defaults to `false`.
   */
  enableBlocksSlots?: boolean;
};

export type ResolvedImport = {
  path: string;
  value: string;
};

export type Context = {
  // Babel has other context
  cwd?: string;
  builder: {
    component: MitosisComponent;
    resolvedImports?: ResolvedImport[];
  };
};
