import * as babel from '@babel/core';
import traverse from 'neotraverse';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { traceReferenceToModulePath } from '../../helpers/trace-reference-to-module-path';
import { MitosisComponent } from '../../types/mitosis-component';
import { parseStateObjectToMitosisState } from './state';

const expressionToNode = (str: string) => {
  const code = `export default ${str}`;
  return (
    (babel.parse(code) as babel.types.File).program.body[0] as babel.types.ExportDefaultDeclaration
  ).declaration;
};

/**
 * Convert <Context.Provider /> to hooks formats by mutating the
 * MitosisComponent tree
 */
export function extractContextComponents(json: MitosisComponent) {
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (item.name.endsWith('.Provider')) {
        const value = item.bindings?.value?.code;
        const name = item.name.split('.')[0];
        const refPath = traceReferenceToModulePath(json.imports, name)!;
        json.context.set[refPath] = {
          name,
          value: value
            ? parseStateObjectToMitosisState(
              expressionToNode(value) as babel.types.ObjectExpression,
            )
            : undefined,
        };

        this.update(
          createMitosisNode({
            name: 'Fragment',
            children: item.children,
          }),
        );
      }
      // TODO: maybe support Context.Consumer:
      // if (item.name.endsWith('.Consumer')) { ... }
    }
  });
}
