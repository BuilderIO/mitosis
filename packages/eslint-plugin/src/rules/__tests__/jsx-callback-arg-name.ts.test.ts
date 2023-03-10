import { RuleTester } from 'eslint';
import rule from '../jsx-callback-arg-name';

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

ruleTester.run('jsx-callback-arg-name', rule, {
  valid: [
    { ...opts, code: '<button/>', ...opts },
    { ...opts, code: '<button type="button"/>', ...opts },
    { ...opts, code: '<button onClick={ null }/>', ...opts },
    { ...opts, code: '<button onClick={ "string" }/>', ...opts },
    { ...opts, code: '<button onClick={ event => doSomething(event) }/>' },
    { ...opts, code: '<button onClick={ () => doSomething() }/>', ...opts },
    { ...opts, code: '<button onClick={ function(event) {} }/>', ...opts },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: '<button onClick={ e => console.log(e) }/>',
      filename: 'file.jsx',
    },
  ],

  invalid: [
    // We make no attempt to rename all references to the variable
    {
      ...opts,
      code: '<button onClick={ e => console.log(e) }/>',
      output: '<button onClick={ event => console.log(e) }/>',
      errors: ['Callback parameter must be called `event`'],
    },
    // Arrow and normal functions are handled
    {
      ...opts,
      code: '<button onClick={ function (e) {} }/>',
      output: '<button onClick={ function (event) {} }/>',
      errors: ['Callback parameter must be called `event`'],
    },
    // Renames the variable
    {
      ...opts,
      code: '<button onClick={ function foobar(e) {} }/>',
      output: '<button onClick={ function foobar(event) {} }/>',
      errors: ['Callback parameter must be called `event`'],
    },
  ],
});
