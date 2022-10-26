import * as babel from '@babel/core';
import generate from '@babel/generator';
import { MitosisExports } from '../../types/mitosis-component';
import { isTypeOrInterface } from './component-types';
import { isImportOrDefaultExport } from './helpers';

const { types } = babel;

export const generateExports = (path: babel.NodePath<babel.types.Program>): MitosisExports => {
  const exportsOrLocalVariables = path.node.body.filter(
    (statement) =>
      !isImportOrDefaultExport(statement) &&
      !isTypeOrInterface(statement) &&
      !types.isExpressionStatement(statement),
  );

  return exportsOrLocalVariables.reduce<MitosisExports>((pre, node) => {
    let name, isFunction;
    if (babel.types.isExportNamedDeclaration(node)) {
      if (
        babel.types.isVariableDeclaration(node.declaration) &&
        babel.types.isIdentifier(node.declaration.declarations[0].id)
      ) {
        name = node.declaration.declarations[0].id.name;
        isFunction = babel.types.isFunction(node.declaration.declarations[0].init);
      }

      if (babel.types.isFunctionDeclaration(node.declaration)) {
        name = node.declaration.id?.name;
        isFunction = true;
      }
    } else {
      if (
        babel.types.isVariableDeclaration(node) &&
        babel.types.isIdentifier(node.declarations[0].id)
      ) {
        name = node.declarations[0].id.name;
        isFunction = babel.types.isFunction(node.declarations[0].init);
      }

      if (babel.types.isFunctionDeclaration(node)) {
        name = node.id?.name;
        isFunction = true;
      }
    }

    if (name) {
      pre[name] = {
        code: generate(node).code,
        isFunction,
      };
    } else {
      console.warn('Could not parse export or variable: ignoring node', node);
    }
    return pre;
  }, {});
};
