import { Node } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { MitosisComponent } from '../../types/mitosis-component';
import { Plugin } from '../../types/plugins';
import { replaceNodes } from '../replace-identifiers';
import { createCodeProcessorPlugin } from './process-code';

export const processSignalsForCode =
  ({ json, processors }: { json: MitosisComponent; processors: Processors }) =>
  (code: string): string => {
    const isTh = json.name === 'RenderBlock';

    const isCode = code === 'childrenContext.value';

    const isYes = isTh && isCode;

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

    if (isYes) {
      console.log('processSignalsForCode', { isTh, isCode });
    }
    if (nodeMaps.length) {
      if (isYes) {
        console.log('before', { code });
      }
      code = replaceNodes({ code, nodeMaps });
      if (isYes) {
        console.log('after', { code });
      }
    }

    return code;
  };

type Processors = {
  props: (name: string) => { from: Node; to: Node };
  context: (name: string) => { from: Node; to: Node };
  state: (name: string) => { from: Node; to: Node };
};

/**
 * Process `mySignal.value` accessors for props, context, and state.
 */
export const processSignals = (processors: Processors) =>
  pipe(
    createCodeProcessorPlugin((_codeType, json) => processSignalsForCode({ processors, json })),
    (plugin): Plugin =>
      () => ({ json: { pre: plugin } }),
  );
