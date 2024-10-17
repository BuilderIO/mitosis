import { generate } from 'astring';
import { isString, some } from 'lodash';

import { parseObjectExpression } from '../helpers/expressions';

import type {
  Expression,
  Identifier,
  ObjectExpression,
  Pattern,
  SimpleLiteral,
  VariableDeclaration,
} from 'estree';
import type { SveltosisComponent } from '../types';

export function getParsedValue(json: SveltosisComponent, element: Expression | Pattern) {
  switch (element.type) {
    case 'Identifier': {
      return element.name;
    }
    case 'ObjectExpression': {
      return parseObjectExpression(json, element as ObjectExpression);
    }
    default: {
      return (element as SimpleLiteral).value as string;
    }
  }
}

function isPropertyOrStateReference(index: string) {
  return isString(index) && (index.includes('props.') || index.includes('state.'));
}

export function parseReferences(json: SveltosisComponent, node: VariableDeclaration) {
  const declaration = node.declarations[0];
  let code: string[] | Record<string, string> | string | {}[];
  let type: any = 'property';

  switch (declaration?.init?.type) {
    case 'ArrayExpression': {
      code = declaration.init.elements.map((element) => {
        return getParsedValue(json, element as Expression);
      });

      if (some(code, (c: string) => isPropertyOrStateReference(c))) {
        const name = (declaration.id as Identifier).name;
        json.state[name] = {
          code: `get ${name}() { return [${code.map((c) => {
            if (isPropertyOrStateReference(c as string)) {
              return c;
            }
            return JSON.stringify(c);
          })}]}`,
          type: 'getter',
        };
        return;
      }

      break;
    }
    case 'ObjectExpression': {
      code = parseObjectExpression(json, declaration.init);
      break;
    }
    case 'ArrowFunctionExpression': {
      code = generate(node);
      type = 'function';

      break;
    }
    case 'FunctionExpression': {
      declaration.init.id = declaration.id as Identifier;
      code = generate(declaration.init);
      type = 'function';

      break;
    }
    default: {
      code = ((declaration?.init as SimpleLiteral)?.value as string) ?? null;
    }
  }

  json.state[(declaration.id as Identifier).name] = {
    code: JSON.stringify(code),
    type,
  };
}
