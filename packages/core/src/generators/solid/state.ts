import { types } from '@babel/core';
import json5 from 'json5';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { getMemberObjectString } from '../../helpers/get-state-object-string';
import { MitosisComponent, MitosisState, StateValue } from '../../types/mitosis-component';
import { ToSolidOptions } from './types';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { checkHasState } from '../../helpers/state';
import { prefixWithFunction, replaceGetterWithFunction } from '../../helpers/patterns';

type State = {
  str: string;
  import: {
    store?: string[];
    solidjs?: string[];
  };
};

const getStateSetterName = (stateName: string) => `set${capitalize(stateName)}`;

const getNewStateSetterExpression =
  (stateType: Exclude<ToSolidOptions['state'], 'mutable'>) =>
  ({
    path,
    propertyName,
  }: {
    path: babel.NodePath<babel.types.AssignmentExpression>;
    propertyName: string;
  }): babel.types.CallExpression => {
    /**
     * passes the value to the setter function
     * ```ts
     * // BEFORE
     * state.count = newCount
     * // AFTER
     * setCount(newCount)
     * ```
     */
    const callValueSetter = (args: types.Expression) =>
      types.callExpression(types.identifier(getStateSetterName(propertyName)), [args]);

    switch (stateType) {
      case 'signals':
        return callValueSetter(path.node.right);
      case 'store':
        console.log('stateSetter: ', path.node.right);
        /**
         * Wrap value in a reconcile() call for Stores updates
         * ```ts
         * // BEFORE
         * state.count = newCount
         * // AFTER
         * setCount(reconcile(newCount))
         * ```
         */
        return callValueSetter(
          types.callExpression(types.identifier('reconcile'), [path.node.right]),
        );
    }
  };

type StateSetterTransformer = ({
  path,
  propertyName,
}: {
  path: babel.NodePath<types.AssignmentExpression>;
  propertyName: string;
}) => types.CallExpression;

const transformStateSetter = ({
  value,
  transformer,
}: {
  value: string;
  transformer: StateSetterTransformer;
}) =>
  babelTransformExpression(value, {
    AssignmentExpression(path: babel.NodePath<babel.types.AssignmentExpression>) {
      const { node } = path;
      if (types.isMemberExpression(node.left)) {
        if (types.isIdentifier(node.left.object)) {
          // TODO: utillity to properly trace this reference to the beginning
          if (node.left.object.name === 'state') {
            // TODO: ultimately support other property access like strings
            const propertyName = (node.left.property as types.Identifier).name;
            const newExpression = transformer({ path, propertyName });
            path.replaceWith(newExpression);
          }
        }
      }
    },
  });

const getStateTypeForValue = ({
  value,
  component,
  options,
}: {
  value: string;
  component: MitosisComponent;
  options: ToSolidOptions;
}) => {
  const stateOverrideForValue: ToSolidOptions['state'] = (component.meta?.useMetadata?.solid as any)
    ?.state?.[stripStateAndPropsRefs(value)];

  const stateType = stateOverrideForValue || options.state;

  return stateType;
};

const updateStateSettersInCode =
  ({ options, component }: { options: ToSolidOptions; component: MitosisComponent }) =>
  (value: string): string => {
    const stateType = getStateTypeForValue({ value, component, options });

    switch (stateType) {
      case 'mutable':
        return value;
      case 'store':
        console.log('stateSetter: ', value);
      case 'signals':
        try {
          return transformStateSetter({
            value,
            transformer: getNewStateSetterExpression(stateType),
          });
        } catch (error) {
          console.log(`[Solid.js]: could not update state setters in ${stateType} code`, value);
          throw error;
        }
    }
  };

const updateStateGettersInCode =
  (options: ToSolidOptions, component: MitosisComponent) =>
  (value: string): string => {
    switch (getStateTypeForValue({ value, component, options })) {
      case 'mutable':
        return value;
      case 'store':
        console.log('stateGetter: ', value);
        return value;
      case 'signals':
        return stripStateAndPropsRefs(value, {
          includeState: true,
          includeProps: false,
          replaceWith: (name) => {
            const state = component.state[name];
            if (
              options.state === 'signals' &&
              // signal accessors are lazy, so we need to add a function call to property calls
              (state?.type === 'property' ||
                // getters become plain functions, requiring a function call to access their value
                state?.type === 'getter')
            ) {
              return `${name}()`;
            }
            return name;
          },
        });
    }
  };

export const updateStateCode = ({
  options,
  component,
  updateSetters = true,
}: {
  options: ToSolidOptions;
  component: MitosisComponent;
  updateSetters?: boolean;
}) =>
  flow(
    updateSetters ? updateStateSettersInCode({ options, component }) : identity,
    updateStateGettersInCode(options, component),
    (x) => x.trim(),
  );

const processStateValue = ({
  options,
  component,
}: {
  options: ToSolidOptions;
  component: MitosisComponent;
}) => {
  const mapValue = updateStateCode({ options, component });

  return ([key, stateVal]: [key: string, stateVal: StateValue | undefined]) => {
    const getDefaultCase = () =>
      pipe(
        value,
        json5.stringify,
        mapValue,
        (x) => `const [${key}, ${getStateSetterName(key)}] = createSignal(${x})`,
      );

    const value = stateVal?.code;
    const type = stateVal?.type;
    if (typeof value === 'string') {
      switch (type) {
        case 'getter':
          return pipe(value, replaceGetterWithFunction, mapValue);
        case 'function':
          return mapValue(value);
        case 'method':
          return pipe(value, prefixWithFunction, mapValue);
        default:
          return getDefaultCase();
      }
    } else {
      return getDefaultCase();
    }
  };
};

const getStoreCode = ({
  json,
  options,
  state,
}: {
  json: MitosisComponent;
  options: ToSolidOptions;
  state: MitosisState;
}) => {
  // TO-DO: stub for now
  return getSignalsCode({ json, options, state });
};

const LINE_ITEM_DELIMITER = '\n\n\n';
const getSignalsCode = ({
  json,
  options,
  state,
}: {
  json: MitosisComponent;
  options: ToSolidOptions;
  state: MitosisState;
}) =>
  Object.entries(state)
    .map(processStateValue({ options, component: json }))
    /**
     * We need to sort state so that signals are at the top.
     */
    .sort((a, b) => {
      const aHasSignal = a.includes('createSignal(');
      const bHasSignal = b.includes('createSignal(');
      if (aHasSignal && !bHasSignal) {
        return -1;
      } else if (!aHasSignal && bHasSignal) {
        return 1;
      } else {
        return 0;
      }
    })
    .join(LINE_ITEM_DELIMITER);

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

  const mutableStateStr = pipe(
    mutable,
    getMemberObjectString,
    (str) => `const state = createMutable(${str});`,
  );
  const signalStateStr = getSignalsCode({ json, options, state: signal });
  const storeStateStr = getStoreCode({ json, options, state: store });

  const stateStr = `
  const state = createMutable(${mutableStateStr});
  ${signalStateStr}
  ${storeStateStr}
  `;

  const hasMutableState = Object.keys(mutable).length > 0;
  const hasSignalState = Object.keys(signal).length > 0;
  const hasStoreState = Object.keys(store).length > 0;

  const importObj: State['import'] = {
    store: [
      ...(hasMutableState ? ['createMutable'] : []),
      ...(hasStoreState ? ['createStore', 'reconcile'] : []),
    ],
    solidjs: [
      ...(hasSignalState ? ['createSignal'] : []),
      ...(hasStoreState ? ['createEffect', 'on'] : []),
    ],
  };

  return {
    str: stateStr,
    import: importObj,
  };
};
