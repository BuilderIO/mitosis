import { generate } from 'astring';
import type {
  LabeledStatement,
  ExpressionStatement,
  AssignmentExpression,
  Identifier,
} from 'estree';

export function parseReactive(json: SveltosisComponent, node: LabeledStatement) {
  const body = node.body as ExpressionStatement;
  const expression = body?.expression as AssignmentExpression | undefined;

  if (!expression) {
    const wrap = node.body.type !== 'BlockStatement';
    const name = `reactive${
      Object.values(json.state).filter((index) => index?.type === 'getter').length
    }`;
    json.state[name] = {
      code: `get ${name}() ${wrap ? '{' : ''}${generate(node.body)}${wrap ? '}' : ''}`,
      type: 'getter',
    };
  } else if (expression.left) {
    const { name } = expression.left as Identifier;
    json.state[name] = {
      code: `get ${name}() {\n return ${generate(expression.right)}}`,
      type: 'getter',
    };
  }
}
