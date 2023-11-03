import { Node, Project, ts, Type } from 'ts-morph';
import { getContextSymbols, getPropsSymbol } from '../../helpers/typescript-project';

const MITOSIS_IMPORT_PATHS = [
  // actual production path
  '/node_modules/@builder.io/mitosis/',
  // possible path if symlinking mitosis locally
  '/mitosis/packages/core/',
];

export const findSignals = ({ filePath, project }: { project: Project; filePath: string }) => {
  const ast = project.getSourceFileOrThrow(filePath);

  if (ast === undefined) {
    throw new Error('Could not find AST. Please provide a correct `filePath`.');
  }

  const reactiveValues = {
    props: new Set<string>(),
    state: new Set<string>(),
    context: new Set<string>(),
  };

  const propsSymbol = getPropsSymbol(ast);

  const contextSymbols = getContextSymbols(ast);

  const checkIsSignalSymbol = (type: Type<ts.Type>) => {
    const symbol = type.getTargetType()?.getAliasSymbol();

    if (!symbol || symbol.getName() !== 'Signal') return false;

    const compilerSymbol = symbol?.compilerSymbol;
    const parent: ts.Symbol | undefined = (compilerSymbol as any).parent;

    if (!parent) return false;

    if (MITOSIS_IMPORT_PATHS.some((path) => parent.getName().includes(path))) {
      return true;
    }

    return false;
  };

  const checkIsOptionalSignal = (node: Node) => {
    let hasUndefined = false;
    let hasSignal = false;

    const perfectMatch = node
      .getType()
      .getUnionTypes()
      .every((type) => {
        if (type.isUndefined()) {
          hasUndefined = true;
          return true;
        } else if (checkIsSignalSymbol(type)) {
          hasSignal = true;
          return true;
        }

        return false;
      });

    return perfectMatch && hasUndefined && hasSignal;
  };

  ast.forEachDescendant((parentNode) => {
    if (Node.isPropertyAccessExpression(parentNode)) {
      const node = parentNode.getExpression();
      const isOptionalAccess = parentNode.hasQuestionDotToken();
      const isSignal = isOptionalAccess
        ? checkIsOptionalSignal(node)
        : checkIsSignalSymbol(node.getType());

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
