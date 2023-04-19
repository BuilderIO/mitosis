import { types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from '../../../helpers/babel-transform';
import { capitalize } from '../../../helpers/capitalize';
import { prefixWithFunction, replaceGetterWithFunction } from '../../../helpers/patterns';
import { MitosisComponent, MitosisState, StateValue } from '../../../types/mitosis-component';
import { ToSolidOptions } from '../types';
import { getStateSetterName, updateStateCode } from './helpers';

const collectUsedStateAndPropsInFunction = (fnValue: string) => {
  const stateUsed = new Set<string>();
  const propsUsed = new Set<string>();
  babelTransformExpression(fnValue, {
    MemberExpression(path) {
      const { node } = path;
      if (types.isIdentifier(node.object)) {
        if (types.isIdentifier(node.property)) {
          if (node.object.name === 'state') {
            stateUsed.add(`state.${node.property.name}`);
          } else if (node.object.name === 'props') {
            propsUsed.add(`props.${node.property.name}`);
          }
        }
      }
    },
  });
  return { stateUsed, propsUsed };
};

export const getStoreCode = ({
  json: component,
  options,
  state,
}: {
  json: MitosisComponent;
  options: ToSolidOptions;
  state: MitosisState;
}) => {
  const mapValue = updateStateCode({ options, component });

  const stateUpdater = ([key, stateVal]: [
    key: string,
    stateVal: StateValue | undefined,
  ]): string => {
    if (!stateVal) {
      return '';
    }

    const getCreateStoreStr = (initialValue: string) =>
      `const [${key}, ${getStateSetterName(key)}] = createStore(${initialValue})`;

    const getDefaultCase = () => pipe(value, mapValue, getCreateStoreStr);

    const value = stateVal.code;
    const type = stateVal.type;
    if (typeof value === 'string') {
      switch (type) {
        case 'getter':
          const getterValueAsFunction = replaceGetterWithFunction(value);
          const { stateUsed, propsUsed } =
            collectUsedStateAndPropsInFunction(getterValueAsFunction);

          const fnValueWithMappedRefs = mapValue(getterValueAsFunction);

          const FUNCTION_NAME = `update${capitalize(key)}`;
          const deps = [
            ...Array.from(stateUsed).map(
              updateStateCode({
                options,
                component,
                // there are no setters in deps
                updateSetters: false,
              }),
            ),
            ...Array.from(propsUsed),
          ].join(', ');
          return `
          const ${FUNCTION_NAME} = ${fnValueWithMappedRefs}
          ${getCreateStoreStr(`${FUNCTION_NAME}()`)}
          createEffect(on(() => [${deps}], () => ${getStateSetterName(
            key,
          )}(reconcile(${FUNCTION_NAME}()))))
          `;
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

  return Object.entries(state).map(stateUpdater).join(LINE_ITEM_DELIMITER);
};

const LINE_ITEM_DELIMITER = '\n\n\n';
