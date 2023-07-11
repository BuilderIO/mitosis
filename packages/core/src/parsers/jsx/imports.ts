import * as babel from '@babel/core';
import { MitosisImport } from '../../types/mitosis-component';
import { Context, ParseMitosisOptions } from './types';

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

export const handleImportDeclaration = ({
  options,
  path,
  context,
}: {
  options: Partial<ParseMitosisOptions>;
  path: babel.NodePath<babel.types.ImportDeclaration>;
  context: Context;
}) => {
  // @builder.io/mitosis or React imports compile away
  const customPackages = options?.compileAwayPackages || [];
  if (
    ['react', '@builder.io/mitosis', '@emotion/react', ...customPackages].includes(
      path.node.source.value,
    )
  ) {
    path.remove();
    return;
  }
  const importObject = mapImportDeclarationToMitosisImport(path.node);
  context.builder.component.imports.push(importObject);

  path.remove();
};
