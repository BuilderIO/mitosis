import { types } from '@babel/core';
import { processSignalsForCode } from '../../helpers/plugins/process-signals';
import { isSlotProperty, replaceSlotsInString } from '../../helpers/slots';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSvelteOptions } from './types';

export const transformReactiveValues = ({ json }: { json: MitosisComponent }) => {
  return processSignalsForCode({
    json,
    processors: {
      props: (name) => {
        return {
          from: types.memberExpression(types.identifier(name), types.identifier('value')),
          to: types.identifier('$' + name),
        };
      },
      context: (name) => {
        return {
          from: types.memberExpression(types.identifier(name), types.identifier('value')),
          to: types.identifier('$' + name),
        };
      },
      state: (name) => {
        return {
          from: types.memberExpression(types.identifier(name), types.identifier('value')),
          to: types.identifier('$' + name),
        };
      },
    },
  });
};

export const stripStateAndProps =
  ({ options, json }: { options: ToSvelteOptions; json: MitosisComponent }) =>
  (code: string) =>
    stripStateAndPropsRefs(code, {
      includeState: options.stateType === 'variables',
      replaceWith: (name) =>
        name === 'children'
          ? '$$slots.default'
          : isSlotProperty(name)
          ? replaceSlotsInString(name, (x) => `$$slots.${x}`)
          : name,
    });
