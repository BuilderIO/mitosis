import { types } from '@babel/core';
import json5 from 'json5';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSolidOptions } from './types';
import { JSON } from '../../types/json';
import { functionLiteralPrefix } from '../../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../../constants/method-literal-prefix';
import { flow, pipe } from 'fp-ts/lib/function';

type State = {
  str: string;
  import: {
    store?: [string];
    solidjs?: [string];
  };
  values?: StateValue[];
};

const getStateSetterName = (stateName: string) => `set${capitalize(stateName)}`;

const updateStateSettersInCode = (options: ToSolidOptions) => (value: string) => {
  switch (options.state) {
    case 'mutable':
      return value;
    case 'signals':
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
  }
};

const updateStateGettersInCode = (options: ToSolidOptions) => (value: string) => {
  switch (options.state) {
    case 'mutable':
      return value;
    case 'signals':
      return stripStateAndPropsRefs(value, {
        includeState: true,
        includeProps: false,
        // signals accessor are functions
        replaceWith: (stategetter) => `${stategetter}()`,
      });
  }
};

export const updateStateCode = (options: ToSolidOptions) =>
  flow(updateStateSettersInCode(options), updateStateGettersInCode(options), (x) => x.trim());

const processStateValue = (options: ToSolidOptions) => {
  const mapValue = updateStateCode(options);
  return ([key, value]: [key: string, value: JSON]): StateValue => {
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        // functions
        const useValue = value.replace(functionLiteralPrefix, '');
        const mappedVal = mapValue(useValue);

        return { str: mappedVal, type: StateValueType.function };
      } else if (value.startsWith(methodLiteralPrefix)) {
        // methods
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGetter = methodValue.startsWith('get ');

        const strippedMethodvalue = pipe(methodValue.replace('get ', ''), mapValue);

        /**
         * FROM:
         * get foo() {
         *   const bar = 'asdf'
         *   return bar
         * }
         *
         *
         * TO:
         * function _getter_foo() {
         *   const bar = 'asdf'
         *   return bar
         * }
         *
         * const foo = _getter_foo()
         */
        // if (isGetter) {
        //   const FUNCTION_NAME_PREFIX = '_getter_';
        //   return `
        //     function ${FUNCTION_NAME_PREFIX}${strippedMethodvalue}

        //     const ${key} = ${FUNCTION_NAME_PREFIX}${key}();
        //     `;
        // } else {
        //   return `function ${strippedMethodvalue}`;
        // }

        return { str: `function ${strippedMethodvalue}`, type: StateValueType.method };
      }
    }

    // Other (data)
    const transformedValue = pipe(value, json5.stringify, mapValue);

    const defaultCase = `const [${key}, ${getStateSetterName(
      key,
    )}] = createSignal(${transformedValue})`;

    return { str: defaultCase, type: StateValueType.data };
  };
};

interface StateValue {
  str: string;
  type: StateValueType;
}

const LINE_ITEM_DELIMITER = '\n\n\n';
const getSignalsCode = (json: MitosisComponent, options: ToSolidOptions) => {
  const values = Object.entries(json.state)
    .map(processStateValue(options))
    /**
     * We need to sort state so that signals are at the top.
     */
    .sort((a, b) => {
      const aHasSignal = a.str.includes('createSignal(');
      const bHasSignal = b.str.includes('createSignal(');
      if (aHasSignal && !bHasSignal) {
        return -1;
      } else if (!aHasSignal && bHasSignal) {
        return 1;
      } else {
        return 0;
      }
    });
  return { str: values.join(LINE_ITEM_DELIMITER), values };
};

export const getState = (json: MitosisComponent, options: ToSolidOptions): State | undefined => {
  const hasState = Object.keys(json.state).length > 0;

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
      const signalsCode = getSignalsCode(json, options);
      return {
        str: signalsCode.str,
        import: { solidjs: ['createSignal'] },
        values: signalsCode.values,
      };
  }
};
