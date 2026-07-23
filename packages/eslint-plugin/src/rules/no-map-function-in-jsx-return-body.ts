import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'no map function in jsx return body',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    if (!isMitosisPath(context.getFilename())) return {};

    return {
      JSXExpressionContainer(node) {
        if (types.isJSXExpressionContainer(node)) {
          if (types.isCallExpression(node.expression)) {
            const callExpr = node.expression;
            if (
              types.isMemberExpression(callExpr.callee) &&
              types.isIdentifier(callExpr.callee.property) &&
              callExpr.callee.property.name === 'map'
            ) {
              context.report({
                node: node as any,
                message:
                  'No map function in jsx return body. Please use <For /> component instead.',
                fix(fixer) {
                  const sourceCode = context.sourceCode || context.getSourceCode();

                  if (!types.isMemberExpression(callExpr.callee)) return null;

                  const arrayExpr = sourceCode.getText(callExpr.callee.object as any);
                  const mapCallback = callExpr.arguments[0];

                  if (!mapCallback) return null;

                  const callbackText = sourceCode.getText(mapCallback as any);
                  const fixes = [];

                  // Replace map with For component
                  fixes.push(
                    fixer.replaceText(
                      node as any,
                      `<For each={${arrayExpr}}>{${callbackText}}</For>`,
                    ),
                  );

                  // Check if For is already imported
                  const ast = sourceCode.ast;
                  const hasForImport = ast.body.some((stmt: any) => {
                    if (!types.isImportDeclaration(stmt)) return false;
                    if (stmt.source.value !== '@builder.io/mitosis') return false;
                    return stmt.specifiers.some(
                      (spec: any) =>
                        types.isImportSpecifier(spec) &&
                        types.isIdentifier(spec.imported) &&
                        spec.imported.name === 'For',
                    );
                  });

                  // Add import if not present
                  if (!hasForImport) {
                    const mitosisImport = ast.body.find(
                      (stmt: any) =>
                        types.isImportDeclaration(stmt) &&
                        stmt.source.value === '@builder.io/mitosis',
                    );

                    if (mitosisImport && types.isImportDeclaration(mitosisImport)) {
                      // Add For to existing import
                      const importText = sourceCode.getText(mitosisImport as any);
                      const newImport = importText.replace(
                        /import\s*{([^}]*)}/,
                        (_, imports) => `import { For,${imports}}`,
                      );
                      fixes.push(fixer.replaceText(mitosisImport as any, newImport));
                    } else {
                      // Add new import at the top
                      fixes.push(
                        fixer.insertTextBeforeRange(
                          [0, 0],
                          "import { For } from '@builder.io/mitosis';\n",
                        ),
                      );
                    }
                  }

                  return fixes;
                },
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
