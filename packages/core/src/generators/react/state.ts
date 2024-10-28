import { capitalize } from '@/helpers/capitalize';
import { getTypedFunction } from '@/helpers/get-typed-function';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { prefixWithFunction, replaceGetterWithFunction } from '@/helpers/patterns';
import { transformStateSetters } from '@/helpers/transform-state-setters';
import { MitosisComponent, StateValue } from '@/types/mitosis-component';
import { types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import traverse from 'neotraverse/legacy';
import { processBinding } from './helpers';
import { ToReactOptions } from './types';

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
    if (!stateVal) {
      return '';
    }

    let value = stateVal.code || '';
    const type = stateVal.type;
    const typeParameter = stateVal.typeParameter;
    const stateType =
      options.typescript && stateVal.typeParameter ? `<${stateVal.typeParameter}>` : '';

    let result = '';
    if (type === 'getter') {
      result = pipe(value, replaceGetterWithFunction, mapValue);
    } else if (type === 'function') {
      console.log('YAY', value);
      result = mapValue(value);
    } else if (type === 'method') {
      result = pipe(value, prefixWithFunction, mapValue);
    } else {
      return `const [${key}, ${getSetStateFnName(key)}] = useState${stateType}(() => (${mapValue(
        value,
      )}))`;
    }

    return getTypedFunction(result, options.typescript, typeParameter);
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
        let values = item.bindings[key]!;
        const newValue = updateStateSettersInCode(values?.code as string, options);
        if (newValue !== values?.code) {
          item.bindings[key] = {
            ...values,
            code: newValue,
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
  return transformStateSetters({
    value,
    transformer: ({ path, propertyName }) =>
      types.callExpression(types.identifier(getSetStateFnName(propertyName)), [path.node.right]),
  });
};
