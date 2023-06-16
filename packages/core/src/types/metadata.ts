import { ContextType } from './mitosis-component';

export type ComponentMetadata = {
  [index: string]: any;
  context?: {
    [index: string]: ContextType;
  };
};
