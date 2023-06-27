import { Node, types } from '@babel/core';
import {
  getSignalMitosisImportForTarget,
  mapSignalType,
} from '../../parsers/jsx/types-identification';
import { Target } from '../../types/config';
import { MitosisComponent } from '../../types/mitosis-component';
import { Plugin } from '../../types/plugins';
import { replaceNodes } from '../replace-identifiers';
import { createCodeProcessorPlugin } from './process-code';
import { CodeType } from './process-code/types';

const processSignalType =
  ({ json, target, codeType }: { json: MitosisComponent; target: Target; codeType?: CodeType }) =>
  (code: string): string => {
    if (json.signals?.signalTypeImportName) {
      return mapSignalType({
        code,
        signalImportName: json.signals.signalTypeImportName,
        target,
      });
    }

    return code;
  };

const processSignalsForCode =
  ({ json, mapSignal }: { json: MitosisComponent; mapSignal: SignalMapper }) =>
  (code: string): string => {
    const nodeMaps: { from: Node; to: Node }[] = [];
    for (const propName in json.props) {
      if (json.props[propName].propertyType === 'reactive') {
        nodeMaps.push({
          from: types.memberExpression(
            types.identifier('props'),
            types.memberExpression(types.identifier(propName), types.identifier('value')),
          ),
          to: mapSignal(propName),
        });
      }
    }

    for (const propName in json.context.get) {
      if (json.context.get[propName].type === 'reactive') {
        nodeMaps.push({
          from: types.memberExpression(types.identifier(propName), types.identifier('value')),
          to: mapSignal(propName),
        });
      }
    }

    for (const propName in json.state) {
      if (json.state[propName]?.propertyType === 'reactive') {
        nodeMaps.push({
          from: types.memberExpression(
            types.identifier('state'),
            types.memberExpression(types.identifier(propName), types.identifier('value')),
          ),
          to: mapSignal(propName),
        });
      }
    }

    if (nodeMaps.length) {
      code = replaceNodes({ code, nodeMaps });
    }

    return code;
  };

type SignalMapper = (name: string) => Node;

/**
 * Processes `Signal` type imports, transforming them to the target's equivalent and adding the import to the component.
 */
export const getSignalTypePlugin =
  ({ target }: { target: Target }): Plugin =>
  () => ({
    json: {
      pre: (json) => {
        createCodeProcessorPlugin((codeType, json) => {
          switch (codeType) {
            // Skip these for now because they break for svelte: `<svelte:element>` becomes `<svelte: element>`.
            // Besides, fairly impossible to endup with a Signal generic there like `<MyComponent<Signal<number>> />`.
            case 'dynamic-jsx-elements':
              return (x) => x;
            default:
              return processSignalType({ json, target, codeType });
          }
        })(json);

        if (json.signals?.signalTypeImportName) {
          json.imports = json.imports || [];
          const signalMappedImport = getSignalMitosisImportForTarget(target);
          if (signalMappedImport) {
            json.imports.push(signalMappedImport);
          }
        }
      },
    },
  });

const getSignalMapperForTarget = (target: Target): SignalMapper => {
  switch (target) {
    case 'svelte':
      return (name) => types.identifier('$' + name);
    default:
      // default case: strip the `.value` accessor
      return (name) => types.identifier(name);
  }
};

/**
 * Processes `mySignal.value` accessors for props, context, and state.
 */
export const getSignalAccessPlugin =
  ({ target }: { target: Target }): Plugin =>
  () => ({
    json: {
      pre: createCodeProcessorPlugin((_codeType, json) =>
        processSignalsForCode({ mapSignal: getSignalMapperForTarget(target), json }),
      ),
    },
  });
