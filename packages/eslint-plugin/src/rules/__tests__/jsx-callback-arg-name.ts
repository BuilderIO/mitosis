import { RuleTester } from 'eslint'
import rule from '../jsx-callback-arg-name'

const opts = {
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
} as const

var ruleTester = new RuleTester()

ruleTester.run('jsx-callback-arg-name', rule, {
  valid: [
    { code: '<button/>', ...opts },
    { code: '<button type="button"/>', ...opts },
    { code: '<button onClick={ null }/>', ...opts },
    { code: '<button onClick={ "string" }/>', ...opts },
    { code: '<button onClick={ event => doSomething(event) }/>', ...opts },
    { code: '<button onClick={ () => doSomething() }/>', ...opts },
    { code: '<button onClick={ function(event) {} }/>', ...opts },
  ],

  invalid: [
    {
      // We make no attempt to rename all references to the variable
      code: '<button onClick={ e => console.log(e) }/>',
      output: '<button onClick={ event => console.log(e) }/>',
      errors: ['Callback parameter must be called `event`'],
      ...opts,
    },
    // Arrow and normal functions are handled
    {
      code: '<button onClick={ function (e) {} }/>',
      output: '<button onClick={ function (event) {} }/>',
      errors: ['Callback parameter must be called `event`'],
      ...opts,
    },
    // Renames the variable
    {
      code: '<button onClick={ function foobar(e) {} }/>',
      output: '<button onClick={ function foobar(event) {} }/>',
      errors: ['Callback parameter must be called `event`'],
      ...opts,
    },
  ],
})
