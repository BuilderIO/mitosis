import * as types from '@babel/types';
import { Rule } from 'eslint';
import { HOOKS } from '../constants/hooks';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow defining async methods as a state property',
      recommended: true,
    },
  },

  create(context) {
    // variables should be defined here
    const filename = context.getFilename();

    if (!isMitosisPath(filename)) return {};

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    //

    const listener: Rule.RuleListener = {
      CallExpression(node) {
        const program = context.getAncestors()[0];

        if (!types.isProgram(program)) return;

        const importSpecifiers = program.body.find((n) => types.isImportDeclaration(n));

        if (!types.isImportDeclaration(importSpecifiers)) return;

        const useState = importSpecifiers.specifiers.find((n) => {
          if (
            types.isImportSpecifier(n) &&
            (n.imported.name === HOOKS.STATE || n.imported.name === HOOKS.STORE)
          ) {
            return true;
          }
        });

        if (
          !useState ||
          !types.isIdentifier(node.callee) ||
          !types.isObjectExpression(node.arguments[0])
        )
          return;

        for (const prop of node.arguments[0].properties) {
          if (
            !types.isProperty(prop) ||
            !types.isIdentifier((prop as types.Property).key) ||
            !types.isFunctionExpression((prop as types.Property).value)
          )
            continue;

          const { async } = (prop as types.Property).value as types.ArrowFunctionExpression;

          if (async) {
            context.report({
              node: prop,
              message: 'async methods can\'t be defined on "state"',
            });
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
