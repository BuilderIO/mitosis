import {
  AssignmentExpression,
  isAssignmentExpression,
  isIdentifier,
  isUpdateExpression,
  Node,
  UpdateExpression,
} from '@babel/types';
import { generate } from 'astring';
import type { CallExpression, FunctionDeclaration, Identifier } from 'estree';
import { capitalize } from 'lodash';
import { walk } from 'svelte/compiler';
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
            dispatchEventName = generate(node_.arguments[0]);
          }
          break;
        }
        case 'UpdateExpression': {
          if (isUpdateExpression(node as Node)) {
            const expression = node as UpdateExpression;
            if (isIdentifier(expression.argument)) {
              const argument = expression.argument.name;
              if (expression.operator === '++') {
                code = code.replace('++', ` = ${argument} + 1`);
              } else if (expression.operator === '--') {
                code = code.replace('--', ` = ${argument} - 1`);
              }
            }
          }
          break;
        }
        case 'AssignmentExpression': {
          if (isAssignmentExpression(node as Node)) {
            const expression = node as AssignmentExpression;
            if (isIdentifier(expression.left)) {
              const argument = expression.left.name;

              if (expression.operator === '+=') {
                code = code.replace('+=', `= ${argument} +`);
              } else if (expression.operator === '-=') {
                code = code.replace('-=', `= ${argument} -`);
              }
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
