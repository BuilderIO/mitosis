import { generate } from 'astring';
import type { Statement } from 'estree';

import { addToOnInitHook } from '../helpers/hooks';

export function parseStatementAtProgramLevel(json: SveltosisComponent, node: Statement) {
  const statement = generate(node);
  addToOnInitHook(json, statement);
}
