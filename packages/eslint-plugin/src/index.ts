import cssNoVars from './rules/css-no-vars';
import refNoCurrent from './rules/ref-no-current';
import noStateDestructuring from './rules/no-state-destructuring';
import jsxCallbackArgNameRule from './rules/jsx-callback-arg-name';
import noAssignPropsToState from './rules/no-assign-props-to-state';
import useStateVarDeclarator from './rules/use-state-var-declarator';
import noAsyncMethodsOnState from './rules/no-async-methods-on-state';
import notVarDeclarationInJSX from './rules/no-var-declaration-in-jsx';
import jsxCallbackArrowFunction from './rules/jsx-callback-arrow-function';
import noVarNameSameAsPropName from './rules/no-var-name-same-as-prop-name';
import noVarNameSameAsStateProperty from './rules/no-var-name-same-as-state-property';
import onlyDefaultFunctionAndImports from './rules/only-default-function-and-imports';
import noConditionalLogicInComponentRender from './rules/no-conditional-logic-in-component-render';
import noVarDeclarationOrAssignmentInComponent from './rules/no-var-declaration-or-assignment-in-component';
import recommended from './configs/recommended';
import { staticControlFlow } from './rules/static-control-flow';

export const rules = {
  'css-no-vars': cssNoVars,
  'ref-no-current': refNoCurrent,
  'static-control-flow': staticControlFlow,
  'no-state-destructuring': noStateDestructuring,
  'jsx-callback-arg-name': jsxCallbackArgNameRule,
  'no-assign-props-to-state': noAssignPropsToState,
  'use-state-var-declarator': useStateVarDeclarator,
  'no-async-methods-on-state': noAsyncMethodsOnState,
  'no-var-declaration-in-jsx': notVarDeclarationInJSX,
  'no-var-name-same-as-prop-name': noVarNameSameAsPropName,
  'jsx-callback-arrow-function': jsxCallbackArrowFunction,
  'no-var-name-same-as-state-property': noVarNameSameAsStateProperty,
  'only-default-function-and-imports': onlyDefaultFunctionAndImports,
  'no-conditional-logic-in-component-render':
    noConditionalLogicInComponentRender,
  'no-var-declaration-or-assignment-in-component':
    noVarDeclarationOrAssignmentInComponent,
};

export const configs = {
  recommended,
};
