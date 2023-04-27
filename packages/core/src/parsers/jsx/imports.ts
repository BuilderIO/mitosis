import * as babel from '@babel/core';
import { MitosisImport } from '../../types/mitosis-component';
import { Context, ParseMitosisOptions } from './types';

const { types } = babel;

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
  const importObject: MitosisImport = {
    imports: {},
    path: path.node.source.value,
    importKind: path.node.importKind,
  };
  for (const specifier of path.node.specifiers) {
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
  context.builder.component.imports.push(importObject);

  path.remove();
};
