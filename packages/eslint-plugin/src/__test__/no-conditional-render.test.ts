import { RuleTester } from 'eslint';

import { staticControlFlow } from '../index';

const ruleTester = new RuleTester();

const options = {
  parserOptions: {
    ecmaVersion: 2018 as 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' as 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
};

ruleTester.run('static-control-flow', staticControlFlow, {
  valid: [
    {
      ...options,
      code: '<Show when={foo}>{bar}</Show>',
    },
    {
      ...options,
      code: '<For each={list}>{item => <span />}</For>',
    },
  ],

  invalid: [
    {
      ...options,
      code: '<div>{foo ? <div /> : <span />}</div>',
      errors: [{ message: /static/i }],
    },
    {
      ...options,
      code: '<div>{list.map(item => <span />)}</div>',
      errors: [{ message: /static/i }],
    },
  ],
});
