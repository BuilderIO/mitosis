import { BaseTranspilerOptions } from '../../types/transpiler';

export type VueVersion = 2 | 3;
export type Api = 'options' | 'composition';

export interface VueVersionOpt {
  vueVersion: VueVersion;
}

export interface ToVueOptions extends BaseTranspilerOptions, VueVersionOpt {
  cssNamespace?: () => string;
  namePrefix?: (path: string) => string;
  asyncComponentImports?: boolean;
  api?: Api;
}
