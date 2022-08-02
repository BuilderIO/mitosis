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
};

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
                  types.callExpression(types.identifier(`set${capitalize(propertyName)}`), [
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
      return stripStateAndPropsRefs(value, { includeState: true, includeProps: false });
  }
};

export const updateStateCode = (options: ToSolidOptions) =>
  flow(updateStateSettersInCode(options), updateStateGettersInCode(options));

const processStateValue = (options: ToSolidOptions) => {
  const mapValue = updateStateCode(options);
  return ([key, value]: [key: string, value: JSON]) => {
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        // functions
        const useValue = value.replace(functionLiteralPrefix, '');
        const mappedVal = mapValue(useValue);

        return mappedVal;
      } else if (value.startsWith(methodLiteralPrefix)) {
        // methods
        const methodValue = value.replace(methodLiteralPrefix, '');
        const useValue = methodValue.replace(/^(get )?/, 'function ');
        return mapValue(useValue);
      }
    }

    // Other (data)
    const transformedValue = pipe(value, json5.stringify, mapValue);

    const defaultCase = `const [${key}, set${capitalize(key)}] = useSignal(${transformedValue})`;

    return defaultCase;
  };
};

const LINE_ITEM_DELIMITER = '\n\n\n';
const getSignalsCode = (json: MitosisComponent, options: ToSolidOptions) =>
  Object.entries(json.state).map(processStateValue(options)).join(LINE_ITEM_DELIMITER);

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
      return {
        str: getSignalsCode(json, options),
        import: { solidjs: ['createSignal'] },
      };
  }
};
