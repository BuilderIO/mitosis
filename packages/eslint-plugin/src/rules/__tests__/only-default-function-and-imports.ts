import { RuleTester } from 'eslint';
import rule from '../only-default-function-and-imports';

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

ruleTester.run('only-default-function-and-imports', rule, {
  valid: [
    {
      ...opts,
      code: `
      import x from "y";
      import {a} from "b";
      export default function MyComponent(props) {
        return (
            <div />
        );
      }
    `,
    },
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
            <div />
        );
      }
    `,
    },
    {
      ...opts,
      code: `
      export const x = y;
  
      export default function MyComponent(props) {
        return (
            <div />
        );
      }
    `,
      filename: 'file.jsx',
    },
  ],
  invalid: [
    {
      ...opts,
      code: `
      import {a} from "b";
      export default function MyComponent(props) {
        
        return (
            <div />
        );
      }
      export const x = y;
    `,
      errors: [
        'Mitosis component files should only contain import declarations, the component itself (in a default export), and type declarations',
      ],
    },
  ],
});
