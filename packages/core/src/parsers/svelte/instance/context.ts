import { generate } from 'astring';

import type {
  BaseCallExpression,
  Identifier,
  VariableDeclaration,
  SimpleLiteral,
  ExpressionStatement,
} from 'estree';
import { stripQuotes } from '../helpers/string';

export function parseGetContext(json: SveltosisComponent, node: VariableDeclaration) {
  if (node.declarations.length > 0) {
    const declaration = node.declarations[0];
    const { name } = declaration.id as Identifier;
    const arguments_ = (declaration.init as BaseCallExpression)?.arguments;

    if (arguments?.length) {
      const argument = arguments_[0] as SimpleLiteral;

      json.context.get[name] = {
        name: generate(argument),
        path: '',
      };
    }
  }
}

export function parseHasContext(json: SveltosisComponent, node: VariableDeclaration) {
  if (node.declarations.length > 0) {
    const declaration = node.declarations[0];
    const { name } = declaration.id as Identifier;
    const arguments_ = (declaration.init as BaseCallExpression)?.arguments;

    if (arguments?.length) {
      const argument = arguments_[0] as SimpleLiteral;

      const generatedArgument = generate(argument);

      json.context.get[stripQuotes(generatedArgument)] = {
        name: generatedArgument,
        path: '',
      };

      json.state[name] = {
        code: `get ${name}() { return ${stripQuotes(generatedArgument)} !== undefined}`,
        type: 'getter',
      };
    }
  }
}

export function parseSetContext(json: SveltosisComponent, node: ExpressionStatement) {
  if (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.arguments?.length
  ) {
    const hook = (node.expression.callee as Identifier).name;

    if (hook === 'setContext') {
      const key = node.expression.arguments[0] as SimpleLiteral;
      const value = node.expression.arguments[1] as Identifier;

      json.context.set[key.value as string] = {
        name: generate(key) as string,
        ref: generate(value),
      };
    }
  }
}
