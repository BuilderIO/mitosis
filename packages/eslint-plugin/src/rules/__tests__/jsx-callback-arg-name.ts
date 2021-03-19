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
    // give me some code that won't trigger a warning
    { ...opts, code: '<button onClick={ event => console.log(event) }/>' },
  ],

  invalid: [
    {
      ...opts,
      code: '<button onClick={ e => console.log(e) }/>',
      errors: [{
        message: 'Fill me in.',
        type: 'Me too',
      }],
    },
  ],
})
