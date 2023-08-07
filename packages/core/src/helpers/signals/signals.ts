import { NodePath, types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { Target } from '../../types/config';
import { mapImportDeclarationToMitosisImport } from '../mitosis-imports';

const getSignalMappingForTarget = (target: Target) => {
  switch (target) {
    case 'svelte':
      const importDeclaration = types.importDeclaration(
        [types.importSpecifier(types.identifier('Writable'), types.identifier('Writable'))],
        types.stringLiteral('svelte/store'),
      );
      importDeclaration.importKind = 'type';

      return {
        getTypeReference: (generics: types.TSType[] = []) =>
          types.tsTypeReference(
            types.identifier('Writable'),
            types.tsTypeParameterInstantiation(generics),
          ),
        importDeclaration,
      };
    default:
      return undefined;
  }
};

export const getSignalMitosisImportForTarget = (target: Target) => {
  const signalType = getSignalMappingForTarget(target);
  if (!signalType) {
    return undefined;
  }
  return mapImportDeclarationToMitosisImport(signalType.importDeclaration);
};

export const getSignalImportName = (code: string): string | undefined => {
  let foundSignalUsage = false;
  let signalImportName: string | undefined = undefined;

  babelTransformExpression(code, {
    ImportSpecifier(path) {
      if (types.isIdentifier(path.node.imported) && path.node.imported.name === 'Signal') {
        if (
          path.parentPath.isImportDeclaration() &&
          path.parentPath.node.source.value === '@builder.io/mitosis'
        ) {
          /**
           * in case the import is aliased, we need to use the local name,
           * e.g. `import { Signal as MySignal } from '@builder.io/mitosis'`
           */
          signalImportName = path.node.local.name;
          path.stop();
        }
      }
    },
  });

  if (!signalImportName) {
    return undefined;
  }

  babelTransformExpression(code, {
    TSTypeReference(path) {
      if (types.isIdentifier(path.node.typeName) && path.node.typeName.name === signalImportName) {
        foundSignalUsage = true;
        path.stop();
      }
    },
  });

  return foundSignalUsage ? signalImportName : undefined;
};

const addSignalImport = ({ code, target }: { code: string; target: Target }) => {
  const signalType = getSignalMappingForTarget(target);

  if (!signalType) {
    return code;
  }

  return babelTransformExpression(code, {
    Program(path) {
      path.node.body.unshift(signalType.importDeclaration);
    },
  });
};
/**
 * Finds all `Signal` types and replaces them with the correct type for the given target.
 * e.g. `Signal<string>` becomes `Writable<string>` for Svelte.
 */
export const mapSignalType = ({
  code,
  target,
  signalImportName = getSignalImportName(code),
}: {
  code: string;
  target: Target;
  signalImportName?: string;
}) => {
  const signalType = getSignalMappingForTarget(target);

  const map = (path: NodePath<types.TSTypeReference>) => {
    if (types.isIdentifier(path.node.typeName) && path.node.typeName.name === signalImportName) {
      const params = path.node.typeParameters?.params || [];

      const newType = signalType?.getTypeReference
        ? signalType.getTypeReference(params)
        : // if no mapping exists, drop `Signal` and just use the generic type passed to `Signal` as-is.
          params[0];

      path.replaceWith(newType);
    }
  };

  return babelTransformExpression(code, {
    TSTypeReference(path) {
      map(path);
    },
  });
};

/**
 * Processes the `Signal` type usage in a plain TS file:
 * - Finds the `Signal` import name
 * - Maps the `Signal` type to the target's equivalent
 * - Adds the equivalent of the `Signal` import to the file
 */
export const mapSignalTypeInTSFile = ({ code, target }: { code: string; target: Target }) => {
  const signalImportName = getSignalImportName(code);

  if (!signalImportName) {
    return code;
  }

  return pipe(mapSignalType({ target, code, signalImportName }), (code) =>
    addSignalImport({ code, target }),
  );
};
