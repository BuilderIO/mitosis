import { MitosisNode } from '../../types/mitosis-node';

export const addPropertiesToJson =
  (properties: MitosisNode['properties']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    properties: {
      ...json.properties,
      ...properties,
    },
  });

export const addBindingsToJson =
  (bindings: MitosisNode['bindings']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    bindings: {
      ...json.bindings,
      ...bindings,
    },
  });

const ON_UPDATE_HOOK_NAME = 'onUpdateHook';

export const getOnUpdateHookName = (index: number) => ON_UPDATE_HOOK_NAME + `${index}`;

export const invertBooleanExpression = (expression: string) => `!Boolean(${expression})`;
