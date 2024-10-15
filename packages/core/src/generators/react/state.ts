import { capitalize } from '@/helpers/capitalize';
import { getTypedFunction } from '@/helpers/get-typed-function';
import { prefixWithFunction, replaceGetterWithFunction } from '@/helpers/patterns';
import { transformStateSetters } from '@/helpers/transform-state-setters';
import { MitosisComponent, StateValue } from '@/types/mitosis-component';
import { types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { ToReactOptions } from './types';

const getSetStateFnName = (stateName: string) => `set${capitalize(stateName)}`;

const processStateValue = (options: ToReactOptions) => {
  return ([key, stateVal]: [key: string, stateVal: StateValue | undefined]) => {
    if (!stateVal) {
      return '';
    }

    const value = stateVal.code || '';
    const type = stateVal.type;
    const typeParameter = stateVal.typeParameter;

    switch (type) {
      case 'property':
        const stateType = options.typescript && typeParameter ? `<${typeParameter}>` : '';
        return `const [${key}, ${getSetStateFnName(key)}] = useState${stateType}(() => (${value}))`;
      case 'getter':
        return pipe(replaceGetterWithFunction(value), (x) =>
          getTypedFunction(x, options.typescript, typeParameter),
        );
      case 'function':
        return getTypedFunction(value, options.typescript, typeParameter);
      case 'method':
        return pipe(prefixWithFunction(value), (x) =>
          getTypedFunction(x, options.typescript, typeParameter),
        );
    }
  };
};

export const getUseStateCode = (json: MitosisComponent, options: ToReactOptions) => {
  const lineItemDelimiter = '\n\n\n';

  const stringifiedState = Object.entries(json.state).map(processStateValue(options));
  return stringifiedState.join(lineItemDelimiter);
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
