import { BaseTranspilerOptions } from '@/types/transpiler';

export type Api = 'options' | 'composition';

export interface ToVueOptions extends BaseTranspilerOptions {
  cssNamespace?: () => string;
  namePrefix?: (path: string) => string;
  asyncComponentImports?: boolean;
  defineComponent?: boolean;
  api: Api;
  convertClassStringToObject?: boolean;
  casing?: 'pascal' | 'kebab';
}
