import * as babel from '@babel/core';
import generate from '@babel/generator';
import { Context } from './types';

const { types } = babel;

export const getPropsTypeRef = (
  node: babel.types.FunctionDeclaration,
  context: Context,
): string | undefined => {
  const param = node.params[0];
  // TODO: component function params name must be props
  if (
    babel.types.isIdentifier(param) &&
    param.name === 'props' &&
    babel.types.isTSTypeAnnotation(param.typeAnnotation)
  ) {
    const paramIdentifier = babel.types.variableDeclaration('let', [
      babel.types.variableDeclarator(param),
    ]);
    const generatedTypes = generate(paramIdentifier)
      .code.replace(/^let\sprops:\s+/, '')
      .replace(/;/g, '');

    if (generatedTypes.startsWith('{')) {
      const propsTypeRef = `${node.id?.name}Props`;

      context.builder.component.types = [
        ...(context.builder.component.types || []),
        `export interface ${propsTypeRef} ${generatedTypes}`,
      ];

      return propsTypeRef;
    }

    return generatedTypes;
  }
  return undefined;
};

export const isTypeImport = (node: babel.Node) =>
  types.isImportDeclaration(node) &&
  node.importKind === 'type' &&
  // Babel adds an implicit JSX type import that we don't want
  node.specifiers[0]?.local.name !== 'JSX';

export const isTypeOrInterface = (node: babel.Node) =>
  types.isTSTypeAliasDeclaration(node) ||
  types.isTSInterfaceDeclaration(node) ||
  (types.isExportNamedDeclaration(node) && types.isTSTypeAliasDeclaration(node.declaration)) ||
  (types.isExportNamedDeclaration(node) && types.isTSInterfaceDeclaration(node.declaration));

export const collectTypes = (node: babel.Node, context: Context) => {
  const typeStr = generate(node).code;
  const { types = [] } = context.builder.component;
  types.push(typeStr);
  context.builder.component.types = types.filter(Boolean);
};
