import { Project, PropertySignature } from 'ts-morph';
import { getPropsSymbol } from '../../helpers/typescript-project';

export const findOptionalProps = (args: { project: Project; code?: string; filePath?: string }) => {
  const ast = args.code
    ? args.project.createSourceFile('__mitosis__temp.lite.tsx', args.code, {
        overwrite: true,
      })
    : args.filePath
    ? args.project.getSourceFileOrThrow(args.filePath)
    : undefined;

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
