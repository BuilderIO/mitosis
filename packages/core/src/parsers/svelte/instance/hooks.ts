import { generate } from 'astring';
import type { ExpressionStatement, BaseCallExpression, BaseFunction } from 'estree';

function parseHookBody(node: ExpressionStatement, stripCurlyBraces = true) {
  const arguments_ = (node.expression as BaseCallExpression)?.arguments;

  let code = generate((arguments_[0] as BaseFunction).body);

  if (stripCurlyBraces && code?.trim().length && code[0] === '{' && code[code.length - 1] === '}')
    code = code.slice(1, -1);

  return code;
}

export function parseOnMount(json: SveltosisComponent, node: ExpressionStatement) {
  json.hooks.onMount = {
    code: parseHookBody(node),
  };
}

export function parseOnDestroy(json: SveltosisComponent, node: ExpressionStatement) {
  json.hooks.onUnMount = {
    code: parseHookBody(node),
  };
}

export function parseAfterUpdate(json: SveltosisComponent, node: ExpressionStatement) {
  json.hooks.onUpdate = [
    {
      code: parseHookBody(node),
    },
  ];
}
