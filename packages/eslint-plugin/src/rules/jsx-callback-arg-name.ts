import { types } from '@babel/core';
import { Rule } from 'eslint';
import * as ESTree from 'estree';
import * as path from 'path';
import { match, not, when } from 'ts-pattern';

interface NodeWithParent extends ESTree.BaseNode {
  parent: NodeWithParent;
  type: NodeType;
}

interface JSXExpressionContainer extends NodeWithParent {
  type: 'JSXExpressionContainer';
  expression: NodeExt;
}

interface JSXAttribute extends NodeWithParent {
  type: 'JSXAttribute';
  value: JSXExpressionContainer;
}

interface JSXOpeningElement extends NodeWithParent {
  type: 'JSXOpeningElement';
  attributes: JSXAttribute[];
}

declare module 'eslint' {
  export namespace Rule {
    interface NodeListener {
      JSXOpeningElement?(node: JSXOpeningElement): void;
      JSXAttribute?(node: JSXAttribute): void;
      JSXExpressionContainer?(node: JSXExpressionContainer): void;
    }
  }
}

// There's some issues with babel's types and eslint's types cooperating so
// this is a stop gap solution.
type NodeJSX = JSXExpressionContainer | JSXAttribute | JSXOpeningElement;
type NodeExt = ESTree.Node | NodeJSX;
type NodeType = NodeExt['type'];

/**
 * Restrict rule to only files that have a '.lite' ext, multiple exts is fine
 * (like file.lite.jsx).
 *
 * @example
 * ```typescript
 * isMitosisPath('file.jsx')
 * // false
 *
 * isMitosisPath('file.lite.jsx')
 * // true
 * ```
 */
export function isMitosisPath(filename: string) {
  filename = path.basename(filename);

  const tokens = filename.split('.');
  const exts = tokens.splice(1);

  return exts.includes('lite');
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'jsx-callback-arg-name',
      category: 'Fill me in',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {},
      // fill in your schema
    ],
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
    const noOp = () => {};

    const listener: Rule.RuleListener = {
      JSXExpressionContainer(node) {
        match(node)
          // Ignore zero length array's
          .with({ expression: { params: [] } }, noOp)
          // Ignore anything that doesn't have a function expression
          .with({ expression: not(when(types.isFunction)) }, noOp)
          // The actual match case
          .with(
            {
              parent: when(types.isJSXAttribute),
              expression: {
                // WARN: This is a list, not a 1-length tuple, this might not
                // work on cases that have multiple args - I don't know if there
                // is anything in the web api that expects multiple args for the
                // callback.
                params: [{ type: 'Identifier', name: not('event') }],
              },
            },
            ({
              expression: {
                params: [arg1],
              },
            }) => {
              context.report({
                node: arg1,
                message: 'Callback parameter must be called `event`',
                fix(fixer) {
                  return fixer.replaceText(arg1, 'event');
                },
              });
            },
          )
          .otherwise(noOp);
      },
    };

    return listener;
  },
};

export default rule;
