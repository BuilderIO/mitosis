import * as babel from '@babel/core';
import { Context } from './types';

const { types } = babel;

export function undoPropsDestructure(path: babel.NodePath<babel.types.FunctionDeclaration>) {
  const { node } = path;
  if (node.params.length && types.isObjectPattern(node.params[0])) {
    const param = node.params[0];
    const propsMap = param.properties.reduce((pre, cur) => {
      if (
        types.isObjectProperty(cur) &&
        types.isIdentifier(cur.key) &&
        types.isIdentifier(cur.value)
      ) {
        pre[cur.value.name] = `props.${cur.key.name}`;
        return pre;
      }
      return pre;
    }, {} as Record<string, string>);

    if (param.typeAnnotation) {
      node.params = [
        {
          ...babel.types.identifier('props'),
          typeAnnotation: param.typeAnnotation,
        },
      ];
      path.replaceWith(node);
    }

    path.traverse({
      JSXExpressionContainer(path) {
        const { node } = path;
        if (types.isIdentifier(node.expression)) {
          const { name } = node.expression;
          if (propsMap[name]) {
            path.replaceWith(
              babel.types.jsxExpressionContainer(babel.types.identifier(propsMap[name])),
            );
          }
        }
      },
    });
  }
}

export function collectDefaultProps(path: babel.NodePath<babel.types.Program>, context: Context) {
  const expressionStatements = path.node.body.filter((statement) =>
    types.isExpressionStatement(statement),
  );

  const defaultPropsStatement: any =
    expressionStatements?.filter((i: any) => {
      const { expression } = i;
      return (
        types.isAssignmentExpression(expression) &&
        types.isMemberExpression(expression.left) &&
        types.isIdentifier(expression.left.property) &&
        expression.left.property.name === 'defaultProps'
      );
    })[0] ?? null;

  if (defaultPropsStatement) {
    defaultPropsStatement?.expression.right.properties.forEach((i: any) => {
      if (i.key?.name) {
        context.builder.component.defaultProps = {
          ...(context.builder.component.defaultProps ?? {}),
          [i.key?.name]: i.value.value,
        };
      }
    });
  }
}
