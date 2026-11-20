import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '<Show> is preferred over ternary expressions',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
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
      ConditionalExpression(node) {
        if (types.isJSXAttribute(node.parent.parent) && types.isJSXExpressionContainer(node.parent))
          return;
        if (types.isExpressionStatement(node.parent)) return;
        if (!types.isJSXExpressionContainer(node.parent)) return;

        context.report({
          node,
          message:
            'Ternary expression support is minimal. Please use the Mitosis `<Show>` component instead.',
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode();
            const condText = sourceCode.getText(node.test as any);
            const consequentText = sourceCode.getText(node.consequent as any);
            const alternateText = sourceCode.getText(node.alternate as any);

            const showComponent = `<Show when={${condText}} else={${alternateText}}>{${consequentText}}</Show>`;

            const programNode = sourceCode.ast;
            let hasShowImport = false;
            let mitosisImport: any = null;

            for (const stmt of programNode.body as any[]) {
              if (!types.isImportDeclaration(stmt)) continue;
              if ((stmt as any).source.value === '@builder.io/mitosis') {
                mitosisImport = stmt;
                hasShowImport = (stmt as any).specifiers.some(
                  (spec: any) =>
                    types.isImportSpecifier(spec) &&
                    types.isIdentifier(spec.imported) &&
                    spec.imported.name === 'Show',
                );
                break;
              }
            }

            const fixes = [fixer.replaceText(node.parent as any, showComponent)];

            if (!hasShowImport) {
              if (mitosisImport) {
                const lastSpecifier = mitosisImport.specifiers[mitosisImport.specifiers.length - 1];
                fixes.push(fixer.insertTextAfter(lastSpecifier as any, ', Show'));
              } else {
                fixes.push(
                  fixer.insertTextBeforeRange(
                    [0, 0],
                    "import { Show } from '@builder.io/mitosis';\n",
                  ),
                );
              }
            }

            return fixes;
          },
        });
      },
    };
    return listener;
  },
};

export default rule;
