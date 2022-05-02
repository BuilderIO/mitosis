import { Rule } from 'eslint';
import * as types from '@babel/types';
import isMitosisPath from './helpers/isMitosisPath';
import cssNoVars from './rules/css-no-vars';
import refNoCurrent from './rules/ref-no-current';
import noStateDestructuring from './rules/no-state-destructuring';
import jsxCallbackArgNameRule from './rules/jsx-callback-arg-name';
import noAssignPropsToState from './rules/no-assign-props-to-state';
import useStateVarDeclarator from './rules/use-state-var-declarator';
import noAsyncMethodsOnState from './rules/no-async-methods-on-state';
import notVarDeclarationInJSX from './rules/no-var-declaration-in-jsx';
import jsxCallbackArrowFunction from './rules/jsx-callback-arrow-function';
import noVarNameSameAsStateProperty from './rules/no-var-name-same-as-state-property';
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
              'Only useEffect with an empty array second argument is allowed. E.g. useEffect(...) must be useEffect(..., [])';
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
  'res-no-current': refNoCurrent,
  'static-control-flow': staticControlFlow,
  'no-state-destructuring': noStateDestructuring,
  'jsx-callback-arg-name': jsxCallbackArgNameRule,
  'no-assign-props-to-state': noAssignPropsToState,
  'use-state-var-declarator': useStateVarDeclarator,
  'no-async-methods-on-state': noAsyncMethodsOnState,
  'no-var-declaration-in-jsx': notVarDeclarationInJSX,
  'jsx-callback-arrow-function': jsxCallbackArrowFunction,
  'no-var-name-same-as-state-property': noVarNameSameAsStateProperty,
  'only-default-function-and-imports': onlyDefaultFunctionAndImports,
  'no-conditional-logic-in-component-render':
    noConditionalLogicInComponentRender,
  'no-var-declaration-or-assignment-in-component':
    noVarDeclarationOrAssignmentInComponent,
};
