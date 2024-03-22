import { pipe } from 'fp-ts/lib/function';
import { getMemberObjectString } from '../../../helpers/get-state-object-string';
import { checkHasState } from '../../../helpers/state';
import { MitosisComponent, MitosisState } from '../../../types/mitosis-component';
import { ToSolidOptions } from '../types';
import { getStateTypeForValue } from './helpers';
import { getSignalsCode } from './signals';
import { getStoreCode } from './store';

type State = {
  str: string;
  import: {
    store?: string[];
    solidjs?: string[];
  };
};

export const getState = ({
  json,
  options,
}: {
  json: MitosisComponent;
  options: ToSolidOptions;
}): State | undefined => {
  const hasState = checkHasState(json);

  if (!hasState) {
    return undefined;
  }

  // unbundle state in case the user provides a type override of one of the state values
  const { mutable, signal, store } = Object.entries(json.state).reduce(
    (acc, [key, value]) => {
      const stateType = getStateTypeForValue({ value: key, component: json, options });

      switch (stateType) {
        case 'mutable':
          return { ...acc, mutable: { ...acc.mutable, [key]: value } };
        case 'signals':
          return { ...acc, signal: { ...acc.signal, [key]: value } };
        case 'store':
          return { ...acc, store: { ...acc.store, [key]: value } };
      }
    },
    { mutable: {}, signal: {}, store: {} } as {
      mutable: MitosisState;
      signal: MitosisState;
      store: MitosisState;
    },
  );

  const hasMutableState = Object.keys(mutable).length > 0;
  const hasSignalState = Object.keys(signal).length > 0;
  const hasStoreState = Object.keys(store).length > 0;

  const mutableStateStr = hasMutableState
    ? pipe(mutable, getMemberObjectString, (str) => `const state = createMutable(${str});`)
    : '';
  const signalStateStr = hasSignalState ? getSignalsCode({ json, options, state: signal }) : '';
  const storeStateStr = hasStoreState ? getStoreCode({ json, options, state: store }) : '';

  const stateStr = `
  ${mutableStateStr}
  ${signalStateStr}
  ${storeStateStr}
  `;

  const importObj: State['import'] = {
    store: [
      ...(hasMutableState ? ['createMutable'] : []),
      ...(hasStoreState ? ['createStore', 'reconcile'] : []),
    ],
    solidjs: [
      ...(hasSignalState ? ['createSignal', 'createMemo'] : []),
      ...(hasStoreState ? ['createEffect', 'on'] : []),
    ],
  };

  return {
    str: stateStr,
    import: importObj,
  };
};
