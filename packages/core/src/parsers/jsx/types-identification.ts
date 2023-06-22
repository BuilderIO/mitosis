import { Node, Project, SourceFile, Symbol, SyntaxKind } from 'ts-morph';

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

const getProject = (tsConfigFilePath: string) => {
  try {
    return new Project({ tsConfigFilePath });
  } catch (err) {
    throw new Error(
      'Error creating Typescript Project. Make sure `tsConfigFilePath` points to a valid tsconfig.json file',
    );
  }
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
        propsSymbol = node.getParameters()[0].getSymbol();
      }
    }
  });

  if (propsSymbol === undefined) {
    throw new Error('Could not find props name');
  }

  return propsSymbol as Symbol;
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

export const findSignals = ({
  code,
  tsConfigFilePath,
}: {
  code: string;
  tsConfigFilePath: string;
}) => {
  const project = getProject(tsConfigFilePath);

  const ast = project.createSourceFile('homepage2.lite.tsx', code);

  const signalSymbol = getSignalSymbol(project);

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
        reactiveValues.props.add(node.getText());
      } else if (nodeSymbol && contextSymbols.has(nodeSymbol)) {
        reactiveValues.context.add(node.getText());
      } else {
        reactiveValues.state.add(node.getText());
      }
    }
  });

  return reactiveValues;
};
