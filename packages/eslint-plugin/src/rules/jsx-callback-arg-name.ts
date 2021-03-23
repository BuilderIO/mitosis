import type { Rule } from 'eslint'
import type * as ESTree from 'estree'

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

type NodeJSX = JSXExpressionContainer | JSXAttribute | JSXOpeningElement
type NodeExt = ESTree.Node | NodeJSX
type NodeType = NodeExt['type']

/**
 * Helper function to make defining type guards more sane.
 * Supply a function that returns a value or false, will infer the guard's type
 * from the union of types returned.
 */
function defguard<B extends A, A>(fn: (term: A) => B | false) {
  return function(term: A): term is B {
    return fn(term) !== false
  }
}

const isFunction = defguard((term: NodeExt) => {
  const members = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
  ] as const

  for (const value of members) {
    if (term.type === value) return term
  }

  return false
})

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
      // fill in your schema
    ],
  },

  create(context) {
    // variables should be defined here

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
        if (!(node.parent.type === 'JSXAttribute')) return

        if (!isFunction(node.expression)) return

        const params = node.expression.params

        // No arguments is fine
        if (params && params.length < 1) return

        const [arg1] = params

        if (arg1.type !== 'Identifier') {
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
