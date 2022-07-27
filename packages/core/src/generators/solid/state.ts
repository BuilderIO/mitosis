import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSolidOptions } from './types';

type State = {
  str: string;
  import: {
    store?: [string];
    solidjs?: [string];
  };
};

export const getState = (json: MitosisComponent, options: ToSolidOptions): State | undefined => {
  const hasState = Object.keys(json.state).length > 0;

  if (!hasState) {
    return undefined;
  }

  switch (options.state) {
    case 'mutable':
      const stateString = getStateObjectStringFromComponent(json);
      return {
        str: `const state = createMutable(${stateString});`,
        import: { store: ['createMutable'] },
      };
    case 'signals':
      const stateString2 = getStateObjectStringFromComponent(json);

      return {
        str: `const state = createMutable(${stateString2});`,
        import: { solidjs: ['createSignal'] },
      };
  }
};
