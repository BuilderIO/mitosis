import * as babel from '@babel/core';
import { MitosisImport } from '../types/mitosis-component';

const { types } = babel;

export const mapImportDeclarationToMitosisImport = (
  node: babel.types.ImportDeclaration,
): MitosisImport => {
  const importObject: MitosisImport = {
    imports: {},
    path: node.source.value,
    importKind: node.importKind,
  };
  for (const specifier of node.specifiers) {
    if (types.isImportSpecifier(specifier)) {
      importObject.imports[specifier.local.name] = (
        specifier.imported as babel.types.Identifier
      ).name;
    } else if (types.isImportDefaultSpecifier(specifier)) {
      importObject.imports[specifier.local.name] = 'default';
    } else if (types.isImportNamespaceSpecifier(specifier)) {
      importObject.imports[specifier.local.name] = '*';
    }
  }
  return importObject;
};
