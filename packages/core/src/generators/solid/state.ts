import { types } from '@babel/core';
import json5 from 'json5';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent, StateValue } from '../../types/mitosis-component';
import { ToSolidOptions } from './types';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import { checkHasState } from '../../helpers/state';

type State = {
  str: string;
  import: {
    store?: [string];
    solidjs?: [string];
  };
};

const getStateSetterName = (stateName: string) => `set${capitalize(stateName)}`;

const updateStateSettersInCode = (options: ToSolidOptions) => (value: string) => {
  switch (options.state) {
    case 'mutable':
      return value;
    case 'signals':
      try {
        return babelTransformExpression(value, {
          AssignmentExpression(path: babel.NodePath<babel.types.AssignmentExpression>) {
            const { node } = path;
            if (types.isMemberExpression(node.left)) {
              if (types.isIdentifier(node.left.object)) {
                // TODO: utillity to properly trace this reference to the beginning
                if (node.left.object.name === 'state') {
                  // TODO: ultimately support other property access like strings
                  const propertyName = (node.left.property as types.Identifier).name;
                  path.replaceWith(
                    types.callExpression(types.identifier(getStateSetterName(propertyName)), [
                      node.right,
                    ]),
                  );
                }
              }
            }
          },
        });
      } catch (error) {
        console.log('[Solid.js]: could not update state setters in signals code', value);
        throw error;
      }
  }
};

const updateStateGettersInCode =
  (options: ToSolidOptions, component: MitosisComponent) => (value: string) => {
    switch (options.state) {
      case 'mutable':
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
    updateSetters ? updateStateSettersInCode(options) : identity,
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
  return ([key, state]: [key: string, state: StateValue | undefined]): string => {
    const code = state?.code;
    const type = state?.type;
    if (typeof code === 'string') {
      return pipe(type === 'getter' ? code.replace(/^(get )?/, 'function ') : code, mapValue);
    }

    // Other (data)
    const transformedValue = pipe(code, json5.stringify, mapValue);

    const defaultCase = `const [${key}, ${getStateSetterName(
      key,
    )}] = createSignal(${transformedValue})`;

    return defaultCase;
  };
};

const LINE_ITEM_DELIMITER = '\n\n\n';
const getSignalsCode = ({ json, options }: { json: MitosisComponent; options: ToSolidOptions }) =>
  Object.entries(json.state)
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

  switch (options.state) {
    case 'mutable':
      const stateString = pipe(
        getStateObjectStringFromComponent(json),
        (str) => `const state = createMutable(${str});`,
      );
      return {
        str: stateString,
        import: { store: ['createMutable'] },
      };
    case 'signals':
      return {
        str: getSignalsCode({ json, options }),
        import: { solidjs: ['createSignal'] },
      };
  }
};
