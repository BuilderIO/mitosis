import * as babel from '@babel/core';
import { mapImportDeclarationToMitosisImport } from '../../helpers/mitosis-imports';
import { Context, ParseMitosisOptions } from './types';

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
