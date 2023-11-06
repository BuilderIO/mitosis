import { isAssignmentExpression, isIdentifier, isUpdateExpression } from '@babel/types';
import { generate } from 'astring';
import type { CallExpression, FunctionDeclaration, Identifier } from 'estree';
import { capitalize } from 'lodash';
import { walk } from 'estree-walker';
import { stripQuotes } from '../helpers/string';

import type { SveltosisComponent } from '../types';

export function parseFunctions(json: SveltosisComponent, node: FunctionDeclaration) {
  const id = node.id as Identifier;

  let dispatchEventName;

  let code = generate(node);

  walk(node, {
    enter(node) {
      switch (node.type) {
        case 'CallExpression': {
          const node_ = node as CallExpression;
          const callee = node_.callee as Identifier;

          if (callee?.name === 'dispatch') {
            const event = generate(node_.arguments[0]);
            dispatchEventName = event;
          }
          break;
        }
        case 'UpdateExpression': {
          if (isUpdateExpression(node) && isIdentifier(node.argument)) {
            const argument = node.argument.name;
            if (node.operator === '++') {
              code = code.replace('++', ` = ${argument} + 1`);
            } else if (node.operator === '--') {
              code = code.replace('--', ` = ${argument} - 1`);
            }
          }
          break;
        }
        case 'AssignmentExpression': {
          if (isAssignmentExpression(node) && isIdentifier(node.left)) {
            const argument = node.left.name;

            if (node.operator === '+=') {
              code = code.replace('+=', `= ${argument} +`);
            } else if (node.operator === '-=') {
              code = code.replace('-=', `= ${argument} -`);
            }
          }
          break;
        }
      }
    },
  });

  if (dispatchEventName) {
    const regex = new RegExp(`dispatch\\(${dispatchEventName},?`);
    code = code.replace(regex, `props.on${capitalize(stripQuotes(dispatchEventName))}(`);
  }

  json.state[id.name] = {
    code,
    type: 'function',
  };
}
