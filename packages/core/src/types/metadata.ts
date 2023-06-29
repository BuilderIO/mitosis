import { ToVueOptions } from '..';

export type ComponentMetadata = {
  [index: string]: any;
  vue?: ToVueOptions;
};
