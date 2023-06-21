import { ContextType } from './mitosis-component';

export type ComponentMetadata = {
  [index: string]: any;
  contextTypes?: {
    [index: string]: ContextType;
  };
  reactiveValues?: {
    props?: string[];
    state?: string[];
    context?: string[];
  };
};
