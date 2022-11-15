import { generate } from 'astring';
import { addToOnInitHook } from '../helpers/hooks';

import type { Statement } from 'estree';
import type { SveltosisComponent } from '../types';

export function parseStatementAtProgramLevel(json: SveltosisComponent, node: Statement) {
  const statement = generate(node);
  addToOnInitHook(json, statement);
}
