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
      description:
        'disallow defining variables with the same name as a state property',
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

        const importSpecifiers = program.body.find((n) =>
          types.isImportDeclaration(n),
        );

        if (!types.isImportDeclaration(importSpecifiers)) return;

        const useState = importSpecifiers.specifiers.find((n) => {
          if (types.isImportSpecifier(n) && n.imported.name === 'useState') {
            return true;
          }
        });

        if (!useState || !types.isIdentifier(node.callee)) return;

        const useStateHookLocalName = useState?.local.name;

        if (
          node.callee.name !== useStateHookLocalName ||
          !types.isObjectExpression(node.arguments[0])
        )
          return;
        const component = program.body.find((n) =>
          types.isExportDefaultDeclaration(n),
        );

        if (!types.isExportDefaultDeclaration(component)) return;

        if (
          !types.isFunctionDeclaration(component.declaration) &&
          !types.isArrowFunctionExpression(component.declaration)
        )
          return;
        if (!types.isBlock(component.declaration.body)) return;
        const { body: componentBody } = component.declaration.body;

        for (const prop of node.arguments[0].properties) {
          if (
            !types.isProperty(prop) ||
            !types.isIdentifier((prop as types.Property).key)
          )
            continue;

          const { name } = (prop as types.Property).key as types.Identifier;

          for (const n of componentBody) {
            if (!types.isVariableDeclaration(n)) continue;

            for (const d of n.declarations) {
              if (
                !types.isVariableDeclarator(d) ||
                !types.isIdentifier(d.id) ||
                d.id.name !== name
              )
                continue;

              context.report({
                node: d,
                message:
                  'variables with the same name as a state property will shadow it',
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
