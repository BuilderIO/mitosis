import { MitosisComponent } from './mitosis-component';

export type Plugin = (
  options?: any,
) => {
  json?: {
    // Happens before any modifiers
    pre?: (json: MitosisComponent) => MitosisComponent | void;
    // Happens after built in modifiers
    post?: (json: MitosisComponent) => MitosisComponent | void;
  };
  code?: {
    // Happens before formatting
    pre?: (code: string) => string;
    // Happens after formatting
    post?: (code: string) => string;
  };
};
