import { Node } from '@babel/core';
import {
  getSignalMitosisImportForTarget,
  mapSignalType,
} from 'src/parsers/jsx/types-identification';
import { Target } from 'src/types/config';
import { MitosisComponent } from '../../types/mitosis-component';
import { Plugin } from '../../types/plugins';
import { replaceNodes } from '../replace-identifiers';
import { createCodeProcessorPlugin } from './process-code';

export const processSignalType =
  ({ json, target }: { json: MitosisComponent; target: Target }) =>
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

export const processSignalsForCode =
  ({ json, processors }: { json: MitosisComponent; processors: Processors }) =>
  (code: string): string => {
    const nodeMaps: { from: Node; to: Node }[] = [];
    for (const propName in json.props) {
      if (json.props[propName].propertyType === 'reactive') {
        nodeMaps.push(processors.props(propName));
      }
    }

    for (const propName in json.context.get) {
      if (json.context.get[propName].type === 'reactive') {
        nodeMaps.push(processors.context(propName));
      }
    }

    for (const propName in json.state) {
      if (json.state[propName]?.propertyType === 'reactive') {
        nodeMaps.push(processors.state(propName));
      }
    }

    if (nodeMaps.length) {
      code = replaceNodes({ code, nodeMaps });
    }

    return code;
  };

type Processors = {
  props: (name: string) => { from: Node; to: Node };
  context: (name: string) => { from: Node; to: Node };
  state: (name: string) => { from: Node; to: Node };
};

/**
 * Processes `Signal` type imports, transforming them to the target's equivalent and adding the import to the component.
 */
export const getSignalTypePlugin =
  ({ target }: { target: Target }): Plugin =>
  () => ({
    json: {
      pre: (json) => {
        createCodeProcessorPlugin((_codeType, json) => processSignalType({ json, target }))(json);

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

/**
 * Processes `mySignal.value` accessors for props, context, and state.
 */
export const getSignalAccessPlugin =
  ({ processors, target }: { processors: Processors; target: Target }): Plugin =>
  () => ({
    json: {
      pre: createCodeProcessorPlugin((_codeType, json) =>
        processSignalsForCode({ processors, json }),
      ),
    },
  });
