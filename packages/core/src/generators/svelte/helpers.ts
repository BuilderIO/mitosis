import { isSlotProperty, replaceSlotsInString } from '../../helpers/slots';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSvelteOptions } from './types';

import { replaceIdentifiers } from '../../helpers/replace-identifiers';

function getReactiveValues(json: MitosisComponent) {
  // const reactiveContext = Object.keys(json.context.get).filter((key) => {
  //   const context = json.context.get[key];
  //   return getContextType({ context: context, component: json }) === 'reactive';
  // });

  const values = json.meta.useMetadata?.reactiveValues;

  if (values) {
    const reactiveValues = [
      ...(values.props || []),
      ...(values.state || []),
      ...(values.context || []),
    ];

    return reactiveValues;
  }

  return undefined;
}

export const transformReactiveValues =
  ({ json }: { json: MitosisComponent }) =>
  (code: string) => {
    const reactiveValues = getReactiveValues(json);
    return reactiveValues
      ? replaceIdentifiers({
          code,
          from: reactiveValues,
          to: (name, identifier) => `$${identifier}.${name}`,
        })
      : code;
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
