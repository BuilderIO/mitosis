import { Node, Project, SourceFile, Symbol, SyntaxKind } from 'ts-morph';
import { babelTransformExpression } from './babel-transform';

export const removeMitosisImport = (code: string): string =>
  babelTransformExpression(code, {
    ImportDeclaration(path) {
      if (path.node.source.value === '@builder.io/mitosis') {
        path.remove();
      }
    },
  });

export const getPropsSymbol = (ast: SourceFile) => {
  let propsSymbol: Symbol | undefined = undefined;
  return ast.forEachChild((node) => {
    if (propsSymbol !== undefined) return undefined;

    if (Node.isArrowFunction(node) || Node.isFunctionDeclaration(node)) {
      if (
        node.hasModifier(SyntaxKind.ExportKeyword) &&
        node.hasModifier(SyntaxKind.DefaultKeyword)
      ) {
        propsSymbol = node.getParameters()[0]?.getSymbol();
        return propsSymbol;
      }
    }
    return undefined;
  });
};

export const getContextSymbols = (ast: SourceFile) => {
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

const getSignalSymbol = (project: Project) => {
  const mitosisRootExportFile = project.getSourceFiles().find((file) => {
    const filePath = file.getFilePath();

    return (
      filePath.includes('mitosis/packages/core/dist/src/index') ||
      // should only be needed for tests to work.
      filePath.includes('mitosis/packages/core/src/index')
    );
  });

  const signalSymbol = mitosisRootExportFile
    ?.getExportSymbols()
    .find((Symbol) => Symbol.getName() === 'Signal');

  if (signalSymbol === undefined) {
    throw new Error(
      'Could not find the Mitosis Signal symbol in your TS project. Is `@builder.io/mitosis` installed correctly?',
    );
  }

  return signalSymbol;
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
