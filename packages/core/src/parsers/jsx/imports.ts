import { mapImportDeclarationToMitosisImport } from '@/helpers/mitosis-imports';
import * as babel from '@babel/core';
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
  const resolvedImport = context.builder.resolvedImports?.find(
    (rImport) => rImport.path === importObject.path,
  );
  if (resolvedImport) {
    delete importObject.imports[resolvedImport.value];
  }

  if (Object.keys(importObject.imports).length > 0) {
    context.builder.component.imports.push(importObject);
  }

  path.remove();
};
