import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow defining variables with the same name as a prop name',
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
      VariableDeclarator(node) {
        const ancestors = context.getAncestors();
        const program = context.getAncestors()[0];

        if (!types.isProgram(program)) return;

        const defaultExport = ancestors.find((n) => types.isExportDefaultDeclaration(n));

        if (!types.isExportDefaultDeclaration(defaultExport)) return;
        if (!types.isFunctionDeclaration(defaultExport.declaration)) return;

        const { declaration } = defaultExport;
        const { params } = declaration;
        const props = params[0];

        if (!types.isIdentifier(props)) return;

        const propsArgName = props.name;
        const { id, init } = node;

        if (!types.isIdentifier(id)) return;

        if (types.isLogicalExpression(init)) {
          const { right, left } = init;

          if (!types.isMemberExpression(left) && !types.isMemberExpression(right)) return;

          if (
            types.isMemberExpression(left) &&
            types.isIdentifier(left.object) &&
            types.isIdentifier(left.property) &&
            left.object.name === propsArgName
          ) {
            if (id.name === left.property.name) {
              context.report({
                node: id,
                message: 'Variable name should not be same as prop name',
              });
            }
          }

          if (
            types.isMemberExpression(right) &&
            types.isIdentifier(right.object) &&
            types.isIdentifier(right.property) &&
            right.object.name === propsArgName
          ) {
            if (id.name === right.property.name) {
              context.report({
                node: id,
                message: 'Variable name should not be same as prop name',
              });
            }
          }
        } else if (types.isMemberExpression(init)) {
          if (
            types.isIdentifier(init.object) &&
            types.isIdentifier(init.property) &&
            init.object.name === propsArgName
          ) {
            if (id.name === init.property.name) {
              context.report({
                node: id,
                message: 'Variable name should not be same as prop name',
              });
            }
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
