import { RuleTester } from 'eslint';

import { staticControlFlow } from '../index';

const ruleTester = new RuleTester();

ruleTester.run('static-control-flow', staticControlFlow, {
  valid: [
    {
      code: '<Show when={foo}>{bar}</div>',
    },
    {
      code: '<For each={list}>{item => <span />}</div>',
    },
  ],

  invalid: [
    {
      code: '<div>{foo ? <div /> : <span />}</div>',
      errors: [{ message: /no/i }],
    },
    {
      code: '<div>{list.map(item => <span />)}</div>',
      errors: [{ message: /static control flow/i }],
    },
  ],
});
