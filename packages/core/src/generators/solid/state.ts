import { types } from '@babel/core';
import json5 from 'json5';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSolidOptions } from './types';
import { JSON } from '../../types/json';
import { functionLiteralPrefix } from 'src/constants/function-literal-prefix';
import { methodLiteralPrefix } from 'src/constants/method-literal-prefix';

type State = {
  str: string;
  import: {
    store?: [string];
    solidjs?: [string];
  };
};

const updateStateSettersInCode = (value: string, options: ToSolidOptions) =>
  babelTransformExpression(value, {
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

/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string, options: ToSolidOptions) =>
  str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');

const processBinding = (str: string, options: ToSolidOptions) =>
  stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });

const valueMapper = (options: ToSolidOptions) => (val: string) => {
  const x = processBinding(updateStateSettersInCode(val, options), options);
  return stripThisRefs(x, options);
};
const processStateValue = (options: ToSolidOptions) => {
  const mapValue = valueMapper(options);
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
    const transformedValue = json5.stringify(mapValue(json5.stringify(value)));
    const defaultCase = `const [${key}, set${capitalize(key)}] = useSignal(${transformedValue})`;

    return defaultCase;
  };
};

const getUseStateCode = (json: MitosisComponent, options: ToSolidOptions) => {
  const lineItemDelimiter = '\n\n\n';

  const stringifiedState = Object.entries(json.state).map(processStateValue(options));
  return stringifiedState.join(lineItemDelimiter);
};

const getSignalsCode = (json: MitosisComponent, options: ToSolidOptions) => getUseStateCode();

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
