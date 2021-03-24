import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import * as path from 'path'
import {types} from '@babel/core'

interface NodeWithParent extends ESTree.BaseNode {
  parent: NodeWithParent
  type: NodeType
}

interface JSXExpressionContainer extends NodeWithParent {
  type: 'JSXExpressionContainer'
  expression: NodeExt
}

interface JSXAttribute extends NodeWithParent {
  type: 'JSXAttribute'
  value: JSXExpressionContainer
}

interface JSXOpeningElement extends NodeWithParent {
  type: 'JSXOpeningElement'
  attributes: JSXAttribute[]
}

declare module 'eslint' {
  export namespace Rule {
    interface NodeListener {
      JSXOpeningElement?(node: JSXOpeningElement): void
      JSXAttribute?(node: JSXAttribute): void
      JSXExpressionContainer?(node: JSXExpressionContainer): void
    }
  }
}

// There's some issues with babel's types and eslint's types cooperating so
// this is a stop gap solution.
type NodeJSX = JSXExpressionContainer | JSXAttribute | JSXOpeningElement
type NodeExt = ESTree.Node | NodeJSX
type NodeType = NodeExt['type']

/**
 * Restrict rule to only files that have a '.lite' ext, multiple exts is fine
 * (like file.lite.jsx).
 *
 * @example
 * ```typescript
 * isJSXLitePath('file.jsx')
 * // false
 *
 * isJSXLitePath('file.lite.jsx')
 * // true
 * ```
 */
function isJSXLitePath(filename: string) {
  filename = path.basename(filename)

  const tokens = filename.split('.')
  const exts = tokens.splice(1)

  return exts.includes('lite')
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
      {}
      // fill in your schema
    ],
  },

  create(context) {
    // variables should be defined here
    const filename = context.getFilename()

    if (!isJSXLitePath(filename)) return {};

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    const listener: Rule.RuleListener = {
      JSXExpressionContainer(node) {
        // Only focus on expressions that are attribute's values.
        if (!(types.isJSXAttribute(node.parent))) return

        if (!types.isFunction(node.expression)) return

        const params = node.expression.params

        // No arguments is fine
        if (params && params.length < 1) return

        const [arg1] = params

        if (!types.isIdentifier(arg1)) {
          return context.report({
            node: arg1,
            message: 'Must be a function parameter',
          })
        }

        if (arg1.name !== 'event') {
          return context.report({
            node: arg1,
            message: 'Callback parameter must be called `event`',
            fix(fixer) {
              return fixer.replaceText(arg1, 'event')
            },
          })
        }
      },
    }

    return listener
  },
}

export default rule
