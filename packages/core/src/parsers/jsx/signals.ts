import { Node, Project, Symbol, ts, Type } from 'ts-morph';
import { getContextSymbols, getPropsSymbol } from '../../helpers/typescript-project';

export const findSignals = (args: { project: Project; signalSymbol: Symbol; filePath: string }) => {
  const { project, signalSymbol } = args;

  const ast = args.project.getSourceFileOrThrow(args.filePath);

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

  const checkIsSignalSymbol = (type: Type<ts.Type>) =>
    type.getTargetType()?.getAliasSymbol() === signalSymbol;

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
