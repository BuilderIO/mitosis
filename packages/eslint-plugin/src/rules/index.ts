import cssNoVars from './css-no-vars';
import refNoCurrent from './ref-no-current';
import noStateDestructuring from './no-state-destructuring';
import jsxCallbackArgNameRule from './jsx-callback-arg-name';
import noAssignPropsToState from './no-assign-props-to-state';
import useStateVarDeclarator from './use-state-var-declarator';
import noAsyncMethodsOnState from './no-async-methods-on-state';
import notVarDeclarationInJSX from './no-var-declaration-in-jsx';
import jsxCallbackArrowFunction from './jsx-callback-arrow-function';
import noVarNameSameAsPropName from './no-var-name-same-as-prop-name';
import noVarNameSameAsStateProperty from './no-var-name-same-as-state-property';
import onlyDefaultFunctionAndImports from './only-default-function-and-imports';
import noConditionalLogicInComponentRender from './no-conditional-logic-in-component-render';
import noVarDeclarationOrAssignmentInComponent from './no-var-declaration-or-assignment-in-component';
import { staticControlFlow } from './static-control-flow';

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
  'no-conditional-logic-in-component-render': noConditionalLogicInComponentRender,
  'no-var-declaration-or-assignment-in-component': noVarDeclarationOrAssignmentInComponent,
};
