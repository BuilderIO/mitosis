import { generate } from 'astring';

import type {
  AssignmentExpression,
  CallExpression,
  ExpressionStatement,
  Identifier,
  LabeledStatement,
} from 'estree';
import type { SveltosisComponent } from '../types';

export function parseReactive(json: SveltosisComponent, node: LabeledStatement) {
  const body = node.body as ExpressionStatement;
  const expression = body?.expression as AssignmentExpression | CallExpression | undefined;

  if (!expression) {
    const wrap = node.body.type !== 'BlockStatement';
    const name = `reactive${
      Object.values(json.state).filter((index) => index?.type === 'getter').length
    }`;
    json.state[name] = {
      code: `get ${name}() ${wrap ? '{' : ''}${generate(node.body)}${wrap ? '}' : ''}`,
      type: 'getter',
    };
  } else if (expression.type === 'AssignmentExpression') {
    const { name } = expression.left as Identifier;
    json.state[name] = {
      code: `get ${name}() {\n return ${generate(expression.right)}}`,
      type: 'getter',
    };
  } else if (expression.type === 'CallExpression') {
    if (node.body.type === 'ExpressionStatement') {
      json.hooks.onUpdate = json.hooks.onUpdate || [];

      json.hooks.onUpdate.push({
        code: generate(node.body),
        deps: `[${expression.arguments.map((arg) => generate(arg))}]`,
      });
    }
  }
}
