import { types } from '@babel/core';
import { flow, identity } from 'fp-ts/lib/function';
import { capitalize } from '../../../helpers/capitalize';
import { replaceStateIdentifier } from '../../../helpers/replace-identifiers';
import { stripStateAndPropsRefs } from '../../../helpers/strip-state-and-props-refs';
import { transformStateSetters } from '../../../helpers/transform-state-setters';
import { MitosisComponent } from '../../../types/mitosis-component';
import { ToSolidOptions } from '../types';

export const getStateSetterName = (stateName: string) => `set${capitalize(stateName)}`;

export const getStateTypeForValue = ({
  value,
  component,
  options,
}: {
  value: string;
  component: MitosisComponent;
  options: ToSolidOptions;
}) => {
  // e.g. state.useContent?.blocks[0].id => useContent
  const extractStateSliceName = stripStateAndPropsRefs(value).split('.')[0].split('?')[0];

  const stateOverrideForValue = component.meta?.useMetadata?.solid?.state?.[extractStateSliceName];

  const stateType = stateOverrideForValue || options.state;

  return stateType;
};

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
const updateStateSettersInCode =
  ({ options, component }: { options: ToSolidOptions; component: MitosisComponent }) =>
  (value: string): string => {
    const stateType = getStateTypeForValue({ value, component, options });

    switch (stateType) {
      case 'mutable':
        return value;
      case 'store':
      case 'signals':
        try {
          return transformStateSetters({
            value,
            transformer: getNewStateSetterExpression(stateType),
          });
        } catch (error) {
          console.error(`[Solid.js]: could not update state setters in ${stateType} code`, value);
          throw error;
        }
    }
  };

const updateStateGettersInCode = (options: ToSolidOptions, component: MitosisComponent) =>
  replaceStateIdentifier((name) => {
    const stateType = getStateTypeForValue({ value: name, component, options });
    const state = component.state[name];
    switch (stateType) {
      case 'signals':
        if (
          // signal accessors are lazy, so we need to add a function call to property calls
          state?.type === 'property' ||
          // getters become plain functions, requiring a function call to access their value
          state?.type === 'getter'
        ) {
          return `${name}()`;
        } else {
          return name;
        }

      case 'store':
      case 'mutable':
        return name;
    }
  });

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
