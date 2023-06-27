import { types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { Node, Project, SourceFile, Symbol, SyntaxKind } from 'ts-morph';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { Target } from '../../types/config';
import { mapImportDeclarationToMitosisImport } from './imports';

const getSignalMappingForTarget = (target: Target) => {
  switch (target) {
    case 'svelte':
      return {
        getTypeReference: (generics: types.TSType[] = []) =>
          types.tsTypeReference(
            types.identifier('Writable'),
            types.tsTypeParameterInstantiation(generics),
          ),
        importDeclaration: types.importDeclaration(
          [types.importSpecifier(types.identifier('Writable'), types.identifier('Writable'))],
          types.stringLiteral('svelte/store'),
        ),
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

const getSignalSymbol = (project: Project) => {
  const symbolExport = project.createSourceFile(
    'homepage3.lite.tsx',
    `import { Signal } from '@builder.io/mitosis';`,
  );

  // Find the original Signal symbol
  let signalSymbol: Symbol | undefined = undefined;
  symbolExport.forEachDescendant((node) => {
    if (Node.isImportSpecifier(node)) {
      signalSymbol = node.getSymbol()?.getAliasedSymbol();
    }
  });

  if (signalSymbol === undefined) {
    throw new Error('Could not find Signal symbol');
  }
  return signalSymbol as Symbol;
};

export const getSignalImportName = (code: string) => {
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
  if (!foundSignalUsage) {
    return signalImportName;
  }

  return undefined;
};

export const addSignalImport = ({ code, target }: { code: string; target: Target }) => {
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

  return babelTransformExpression(code, {
    TSTypeReference(path) {
      if (types.isIdentifier(path.node.typeName) && path.node.typeName.name === signalImportName) {
        const params = path.node.typeParameters?.params || [];

        const newType = signalType?.getTypeReference
          ? signalType.getTypeReference(params)
          : // if no mapping exists, drop `Signal` and just use the generic type passed to `Signal` as-is.
            params[0];

        path.replaceWith(newType);
      }
    },
  });
};

/**
 * Processes the `Signal` type usage in a plain TS file:
 * - Finds the Signal import name
 * - Maps the Signal type to the target's equivalent
 * - Adds the equivalent of the Signal import to the file
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

const getProject = (tsConfigFilePath: string) => {
  try {
    return new Project({ tsConfigFilePath });
  } catch (err) {
    throw new Error(
      'Error creating Typescript Project. Make sure `tsConfigFilePath` points to a valid tsconfig.json file',
    );
  }
};

export const createTypescriptProject = (tsConfigFilePath: string) => {
  const project = getProject(tsConfigFilePath);
  const signalSymbol = getSignalSymbol(project);
  return { project, signalSymbol };
};

const getPropsSymbol = (ast: SourceFile) => {
  let propsSymbol: Symbol | undefined = undefined;
  ast.forEachChild((node) => {
    if (propsSymbol !== undefined) return;

    if (Node.isArrowFunction(node) || Node.isFunctionDeclaration(node)) {
      if (
        node.hasModifier(SyntaxKind.ExportKeyword) &&
        node.hasModifier(SyntaxKind.DefaultKeyword)
      ) {
        propsSymbol = node.getParameters()[0]?.getSymbol();
      }
    }
  });

  return propsSymbol as Symbol | undefined;
};

const getContextSymbols = (ast: SourceFile) => {
  const contextSymbols = new Set<Symbol>();

  ast.forEachDescendant((node) => {
    if (!Node.isVariableDeclaration(node)) return;

    const initializer = node.getInitializer();

    if (!Node.isCallExpression(initializer)) return;
    if (initializer.getExpression().getText() !== 'useContext') return;

    const contextSymbol = node.getNameNode().getSymbol();

    if (contextSymbol === undefined) return;

    contextSymbols.add(contextSymbol);
  });

  return contextSymbols;
};

export const findSignals = (args: {
  project: Project;
  signalSymbol: Symbol;
  code?: string;
  filePath?: string;
}) => {
  const { project, signalSymbol } = args;

  const ast = args.code
    ? args.project.createSourceFile('homepage2.lite.tsx', args.code)
    : args.filePath
    ? args.project.getSourceFileOrThrow(args.filePath)
    : undefined;

  if (ast === undefined) {
    throw new Error('Could not find AST. Please provide either `code` or `filePath` configs.');
  }

  const reactiveValues = {
    props: new Set<string>(),
    state: new Set<string>(),
    context: new Set<string>(),
  };

  const propsSymbol = getPropsSymbol(ast);

  const contextSymbols = getContextSymbols(ast);

  ast.forEachDescendant((parentNode) => {
    if (Node.isPropertyAccessExpression(parentNode)) {
      const node = parentNode.getExpression();
      const aliasSymbol = node.getType().getTargetType()?.getAliasSymbol();
      const isSignal = aliasSymbol === signalSymbol;

      if (!isSignal) return;

      let isInsideType = false;
      let isInsideDeclaration = false;
      node.getParentWhile((parent, child) => {
        // stop once we hit the function block
        if (Node.isBlock(child) || Node.isBlock(parent)) {
          return false;
        }

        // crawl up parents to make sure we're not inside a type
        if (Node.isTypeNode(parent) || Node.isTypeAliasDeclaration(parent)) {
          isInsideType = true;
          return false;
        }

        return true;
      });

      if (isInsideType) return;
      if (isInsideDeclaration) return;

      const nodeSymbol = node.getSymbol();

      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getSymbol() === propsSymbol
      ) {
        reactiveValues.props.add(node.getNameNode().getText());
      } else if (nodeSymbol && contextSymbols.has(nodeSymbol)) {
        reactiveValues.context.add(node.getText());
      } else {
        reactiveValues.state.add(node.getText());
      }
    }
  });

  return reactiveValues;
};
