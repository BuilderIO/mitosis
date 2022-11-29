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
      description: 'disallow defining variables with the same name as a state property',
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

        if (!useState || !types.isIdentifier(node.callee)) return;

        const useStateHookLocalName = useState?.local.name;

        if (
          node.callee.name !== useStateHookLocalName ||
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
        if (!types.isBlock(component.declaration.body)) return;
        const { body: componentBody } = component.declaration.body;

        for (const prop of node.arguments[0].properties) {
          if (!types.isProperty(prop) || !types.isIdentifier((prop as types.Property).key))
            continue;

          if (types.isFunctionExpression((prop as types.Property).value)) {
            const { body } = ((prop as types.Property).value as types.FunctionExpression).body;
            const varDeclarators: types.VariableDeclarator[] = [];
            body.forEach((n) => {
              if (types.isVariableDeclaration(n)) {
                varDeclarators.push(...n.declarations);
              }
            });

            if (!varDeclarators.length) continue;

            for (const d of varDeclarators) {
              for (const prop of node.arguments[0].properties) {
                if (!types.isProperty(prop) || !types.isIdentifier((prop as types.Property).key))
                  continue;
                const { name } = (prop as types.Property).key as types.Identifier;
                if (!types.isIdentifier(d.id)) continue;
                if (d.id.name === name) {
                  context.report({
                    node: prop,
                    message: 'variables with the same name as a state property will shadow it',
                  });
                }
              }
            }
          } else {
            const { name } = (prop as types.Property).key as types.Identifier;

            for (const n of componentBody) {
              if (types.isVariableDeclaration(n)) {
                for (const d of n.declarations) {
                  if (
                    !types.isVariableDeclarator(d) ||
                    !types.isIdentifier(d.id) ||
                    d.id.name !== name
                  )
                    continue;

                  context.report({
                    node: d,
                    message: 'variables with the same name as a state property will shadow it',
                  });
                }
              } else if (types.isFunctionDeclaration(n)) {
                const { body } = n.body;
                const varDeclarators: types.VariableDeclarator[] = [];
                body.forEach((n) => {
                  if (types.isVariableDeclaration(n)) {
                    varDeclarators.push(...n.declarations);
                  }
                });

                for (const d of varDeclarators) {
                  if (!types.isIdentifier(d.id)) continue;

                  if (d.id.name === name) {
                    context.report({
                      node: prop,
                      message: 'variables with the same name as a state property will shadow it',
                    });
                  }
                }
              }
            }
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
