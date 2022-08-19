import * as babel from '@babel/core';

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
