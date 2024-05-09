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
      description: 'disallow defining setters with the same name as a state property',
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
      Property(node) {
        if (
          types.isIdentifier(node.key) &&
          types.isCallExpression(node.parent?.parent) &&
          types.isIdentifier(node.parent?.parent?.callee) &&
          node.parent?.parent?.callee?.name === 'useStore'
        ) {
          const stateKeys = types.isObjectExpression(node.parent)
            ? node.parent.properties.map((property) => {
                if (property.type === 'Property' && types.isIdentifier(property.key)) {
                  return property.key.name;
                }
                return undefined;
              })
            : [];

          const propName = node.key.name;

          const isSetter =
            propName.startsWith('set') &&
            propName.length > 3 &&
            propName[3] === propName[3].toUpperCase();

          if (!isSetter) return;

          const strippedStateName = propName.replace(/^set/, '');
          const lowercasedStateName =
            strippedStateName.charAt(0).toLowerCase() + strippedStateName.slice(1);

          if (stateKeys.includes(lowercasedStateName)) {
            context.report({
              node,
              message: `Cannot name a state property \`${propName}\` because of a collision with Mitosis-generated code for the state property \`${lowercasedStateName}\`. Please use a different name.`,
            });
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
