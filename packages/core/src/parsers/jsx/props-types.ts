import { Project, PropertySignature } from 'ts-morph';
import { getPropsSymbol } from '../../helpers/typescript-project';

export const findOptionalProps = (args: { project: Project; filePath: string }) => {
  const ast = args.project.getSourceFileOrThrow(args.filePath);

  if (ast === undefined) {
    throw new Error('Could not find AST. Please provide either `code` or `filePath` configs.');
  }

  const propsSymbol = getPropsSymbol(ast);

  if (!propsSymbol) return [];

  return propsSymbol
    .getDeclarations()[0]
    .getType()
    .getProperties()
    .map((p) => p.getDeclarations()[0])
    .filter(
      (k): k is PropertySignature =>
        PropertySignature.isPropertySignature(k) && k.hasQuestionToken(),
    )
    .map((k) => k.getName());
};
