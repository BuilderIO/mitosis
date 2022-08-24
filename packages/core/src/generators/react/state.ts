import { types } from '@babel/core';
import json5 from 'json5';
import traverse from 'traverse';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { MitosisComponent, StateValue } from '../../types/mitosis-component';
import { pipe } from 'fp-ts/lib/function';
import { ToReactOptions } from './types';
import { processBinding } from './helpers';
import { prefixWithFunction, replaceGetterWithFunction } from '../../helpers/patterns';

/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');
};

export const processHookCode = ({ str, options }: { str: string; options: ToReactOptions }) =>
  processBinding(updateStateSettersInCode(str, options), options);

const valueMapper = (options: ToReactOptions) => (val: string) => {
  const x = processHookCode({ str: val, options });
  return stripThisRefs(x, options);
};
const getSetStateFnName = (stateName: string) => `set${capitalize(stateName)}`;

const processStateValue = (options: ToReactOptions) => {
  const mapValue = valueMapper(options);

  return ([key, stateVal]: [key: string, stateVal: StateValue | undefined]) => {
    const getDefaultCase = () =>
      pipe(
        value,
        json5.stringify,
        mapValue,
        (x) => `const [${key}, ${getSetStateFnName(key)}] = useState(() => (${x}))`,
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

export const getUseStateCode = (json: MitosisComponent, options: ToReactOptions) => {
  const lineItemDelimiter = '\n\n\n';

  const stringifiedState = Object.entries(json.state).map(processStateValue(options));
  return stringifiedState.join(lineItemDelimiter);
};

export const updateStateSetters = (json: MitosisComponent, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return;
  }
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        let values = item.bindings[key];
        const newValue = updateStateSettersInCode(values?.code as string, options);
        if (newValue !== values?.code) {
          item.bindings[key] = {
            code: newValue,
            arguments: values?.arguments,
          };
        }
      }
    }
  });
};

export const updateStateSettersInCode = (value: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return value;
  }
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
              types.callExpression(types.identifier(getSetStateFnName(propertyName)), [node.right]),
            );
          }
        }
      }
    },
  });
};
