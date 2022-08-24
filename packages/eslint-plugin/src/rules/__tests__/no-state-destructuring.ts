import { RuleTester } from 'eslint';
import rule from '../no-state-destructuring';

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
