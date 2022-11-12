import { generate } from 'astring';
import { BaseNode, ExpressionStatement } from 'estree';
import { addToOnInitHook } from '../helpers/hooks';

import type { SveltosisComponent } from '../types';

export function parseMemberExpression(
  json: SveltosisComponent,
  node: ExpressionStatement,
  parent?: BaseNode,
) {
  if (parent?.type === 'Program') {
    addToOnInitHook(json, generate(node));
  }
}
