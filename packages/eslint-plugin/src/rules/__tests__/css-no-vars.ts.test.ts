import { RuleTester } from 'eslint';
import rule from '../css-no-vars';

const opts = {
  filename: 'component.lite.tsx',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
} as const;

var ruleTester = new RuleTester();

ruleTester.run('css-no-vars', rule, {
  valid: [
    { ...opts, code: '<button/>' },
    { ...opts, code: '<button css={{ color: "red" }} />' },
    { ...opts, code: '<button css={{ fontSize: 12 }} />' },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: '<button onClick={ null }/>',
      filename: 'file.jsx',
    },
  ],
  invalid: [
    // Doesn't accept Identifier as object properties
    {
      ...opts,
      code: '<button css={{ color: red }} />',
      errors: ["Css properties can't be a variable"],
    },
    // Doesn't accept Identifier as object properties
    {
      ...opts,
      code: '<button css={{ fontSize: 10, color: red }} />',
      errors: ["Css properties can't be a variable"],
    },
    // Doesn't accept string as value for the css attribute
    {
      ...opts,
      code: '<button css={"sting"} />',
      errors: ['Css attribute value must be an object'],
    },
    // Doesn't accept number as value for the css attribute
    {
      ...opts,
      code: '<button css={1} />',
      errors: ['Css attribute value must be an object'],
    },
    // Doesn't accept boolean as value for the css attribute
    {
      ...opts,
      code: '<button css={true} />',
      errors: ['Css attribute value must be an object'],
    },
    // Doesn't accept ternary expression as value
    {
      ...opts,
      code: '<button css={{color: a ? "red" : "green" }} />',
      errors: ["Css properties can't be a ternary expression"],
    },
    {
      ...opts,
      code: '<button css={{backgroundColor: state.red }} />',
      errors: ["Css properties can't be a member expression"],
    },
    {
      ...opts,
      code: '<button css={{backgroundColor: state.red, color: red }} />',
      errors: ["Css properties can't be a member expression", "Css properties can't be a variable"],
    },
  ],
});
