import { RuleTester } from 'eslint'
import rule from '../jsx-callback-arg-name'

var ruleTester = new RuleTester()
ruleTester.run('jsx-callback-arg-name', rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: '20c4f03',
      errors: [{
        message: 'Fill me in.',
        type: 'Me too',
      }],
    },
  ],
})
