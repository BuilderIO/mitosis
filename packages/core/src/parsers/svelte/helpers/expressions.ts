import { generate } from 'astring';
import { ObjectExpression, Property } from 'estree';

import { getParsedValue } from '../instance/references';

export function parseObjectExpression(json: SveltosisComponent, node: ObjectExpression) {
  const properties = (node as ObjectExpression).properties.map((n: any) => {
    const node_ = n as Property;
    return {
      key: generate(node_.key),
      value: getParsedValue(json, node_.value),
    };
  });

  const c = {};
  for (const item of properties) {
    Object.assign(c, { [item.key]: item.value });
  }
  return c;
}
