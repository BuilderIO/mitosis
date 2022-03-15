import { Rule } from 'eslint';
import { types } from '@babel/core';
import cssNoVars from './rules/css-no-vars';
import isMitosisPath from './helpers/isMitosisPath';
import jsxCallbackArgNameRule from './rules/jsx-callback-arg-name';
import useStateVarDeclarator from './rules/use-state-var-declarator';
import notVarDeclarationInJSX from './rules/no-var-declaration-in-jsx';
import jsxCallbackArrowFunction from './rules/jsx-callback-arrow-function';
import onlyDefaultFunctionAndImports from './rules/only-default-function-and-imports';
import noConditionalLogicInComponentRender from './rules/no-conditional-logic-in-component-render';
import noVarDeclarationOrAssignmentInComponent from './rules/no-var-declaration-or-assignment-in-component';

export const staticControlFlow: Rule.RuleModule = {
  create(context) {
    if (!isMitosisPath(context.getFilename())) return {};

    return {
      VariableDeclarator(node) {
        if (types.isVariableDeclarator(node)) {
          if (
            types.isObjectPattern(node.id) &&
            types.isIdentifier(node.init) &&
            node.init.name === 'state'
          ) {
            context.report({
              node: node as any,
              message:
                'Destructuring the state object is currently not supported',
            });
          }
        }
      },

      CallExpression(node) {
        if (types.isCallExpression(node)) {
          if (
            types.isIdentifier(node.callee) &&
            node.callee.name === 'useEffect'
          ) {
            const useEffectMessage =
              'Only useEffect with an empty array second argument is allowed. E.g. useEfffect(...) must be useEffect(..., [])';
            const secondArg = node.arguments[1];
            if (
              !(
                secondArg &&
                types.isArrayExpression(secondArg) &&
                secondArg.elements.length === 0
              )
            ) {
              context.report({
                node: node,
                message: useEffectMessage,
              });
            }
          }
        }
      },

      JSXExpressionContainer(node) {
        if (types.isJSXExpressionContainer(node)) {
          if (types.isConditionalExpression(node.expression)) {
            if (
              types.isJSXElement(node.expression.consequent) ||
              types.isJSXElement(node.expression.alternate)
            ) {
              context.report({
                node: node as any,
                message:
                  'Ternaries around JSX Elements are not currently supported. Instead use binary expressions - e.g. {foo ? <bar /> : <baz />} should be {foo && <bar />}{!foo && <baz />}',
              });
            }
          }
        }
      },
    };
  },
};

export const rules = {
  'css-no-vars': cssNoVars,
  'static-control-flow': staticControlFlow,
  'jsx-callback-arg-name': jsxCallbackArgNameRule,
  'use-state-var-declarator': useStateVarDeclarator,
  'no-var-declaration-in-jsx': notVarDeclarationInJSX,
  'jsx-callback-arrow-function': jsxCallbackArrowFunction,
  'only-default-function-and-imports': onlyDefaultFunctionAndImports,
  'no-conditional-logic-in-component-render': noConditionalLogicInComponentRender,
  'no-var-declaration-or-assignment-in-component': noVarDeclarationOrAssignmentInComponent,
};
