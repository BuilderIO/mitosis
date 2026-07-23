import { RuleTester } from 'eslint';
import rule from '../no-state-destructuring';

const opts = {
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

var ruleTester = new RuleTester();

ruleTester.run('no-state-destructuring', rule, {
  valid: [
    {
      ...opts,
      code: `
      export default function MyComponent() {
        const state = useStore({ foo: '1' });
      
        onMount(() => {
          const foo = state.foo;
        });
      }      
      `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
      export default function MyComponent() {
        const state = useStore({ foo: '1' });
      
        onMount(() => {
          const { foo } = state;
        });
      }
      `,
      filename: 'file.jsx',
    },
  ],
  invalid: [
    {
      ...opts,
      code: `
      export default function MyComponent() {
        const state = useStore({ foo: '1' });
      
        onMount(() => {
          const { foo } = state;
        });
      }
      `,
      errors: ["destructuring state isn't allowed: use standard assignment instead"],
    },
  ],
});
