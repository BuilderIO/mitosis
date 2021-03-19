import type { Rule } from 'eslint'
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'jsx-callback-arg-name',
      category: 'Fill me in',
      recommended: true,
    },
    // fixable: null, // or "code" or "whitespace"
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
      // give me methods
    }

    return listener
  },
}

export default rule
