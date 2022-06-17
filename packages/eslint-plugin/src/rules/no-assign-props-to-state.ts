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
      description: 'disallow assigning props to state',
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

        if (!types.isImportSpecifier(useState)) return;
        if (!types.isIdentifier(node.callee)) return;
        if (node.callee.name !== useState.imported.name) return;

        if (
          !useState ||
          !types.isIdentifier(node.callee) ||
          !types.isObjectExpression(node.arguments[0])
        )
          return;

        const component = program.body.find((n) => types.isExportDefaultDeclaration(n));

        if (!types.isExportDefaultDeclaration(component)) return;

        if (
          !types.isFunctionDeclaration(component.declaration) &&
          !types.isArrowFunctionExpression(component.declaration)
        )
          return;

        const { params } = component.declaration;

        if (!types.isIdentifier(params[0])) return;
        const { name } = params[0];

        for (const prop of node.arguments[0].properties) {
          if (!types.isProperty(prop)) return;

          const { object } = (prop as types.Property).value as types.MemberExpression;

          if (!types.isIdentifier(object)) return;

          if (object.name === name) {
            context.report({
              node: prop,
              message: '"props" can\'t be assign to  to "state" directly',
            });
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
