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
      description: 'disallow using ref.current',
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
      MemberExpression(node) {
        if (types.isIdentifier(node.property) && node.property.name === 'current') {
          if (types.isIdentifier(node.object)) {
            const { name } = node.object;
            const program = context.getAncestors()[0];

            if (!types.isProgram(program)) return;

            const importSpecifiers = program.body.find((n) => types.isImportDeclaration(n));

            if (!types.isImportDeclaration(importSpecifiers)) return;

            const useRef = importSpecifiers.specifiers.find((n) => {
              if (types.isImportSpecifier(n) && n.imported.name === 'useRef') {
                return true;
              }
            });

            if (!useRef) return;

            const useRefHookLocalName = useRef?.local.name;

            const component = program.body.find((n) => types.isExportDefaultDeclaration(n));

            if (!types.isExportDefaultDeclaration(component)) return;

            if (
              !types.isFunctionDeclaration(component.declaration) &&
              !types.isArrowFunctionExpression(component.declaration)
            )
              return;

            if (!types.isBlock(component.declaration.body)) return;
            const { body: componentBody } = component.declaration.body;
            for (const n of componentBody) {
              if (!types.isVariableDeclaration(n)) continue;

              for (const d of n.declarations) {
                if (
                  !types.isVariableDeclarator(d) ||
                  !types.isIdentifier(d.id) ||
                  d.id.name !== name ||
                  !types.isCallExpression(d.init) ||
                  !types.isIdentifier(d.init.callee) ||
                  d.init.callee.name !== useRefHookLocalName
                )
                  continue;

                context.report({
                  node,
                  message: `property "current" doesn\'t exists on refs. you can call methods directly on them e.g: ${name}.focus(), or assign them a value e.g: ${name} = 1;`,
                });
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
