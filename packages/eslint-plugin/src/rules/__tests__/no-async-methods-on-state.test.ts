import { RuleTester } from 'eslint';
import rule from '../no-async-methods-on-state';

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

ruleTester.run('no-async-methods-on-state', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      export default function MyComponent() {
        const state = useStore({
          doSomethingAsync(event) {
            void (async function() {
              const response = await fetch(); /* ... */
            })();
          },
        });
      }
      `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      export default function MyComponent() {
        const state = useStore({
          async doSomethingAsync(event) {
            const response = await fetch(); /* ... */
          },
        });
        return <div />
      }
      `,
      filename: 'file.jsx',
    },
  ],
  invalid: [
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';

      export default function MyComponent() {
        const state = useStore({
          async doSomethingAsync(event) {
      
            const response = await fetch(); /* ... */
          },
        });
        
        return <div />
      }
      `,
      errors: ['async methods can\'t be defined on "state"'],
    },
  ],
});
