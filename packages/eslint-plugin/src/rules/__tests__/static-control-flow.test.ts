import { RuleTester } from 'eslint';

import { staticControlFlow } from '../static-control-flow';

const ruleTester = new RuleTester();

const options = {
  filename: 'component.lite.tsx',
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
} as const;

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
    {
      ...options,
      code: '<div>{list.map(item => <span />)}</div>',
    },
  ],

  invalid: [
    {
      ...options,
      code: '<div>{foo ? <div /> : <span />}</div>',
      errors: [{ message: /Ternaries/i }],
    },
  ],
});
