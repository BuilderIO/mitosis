import { RuleTester } from 'eslint';
import rule from '../no-conditional-logic-in-component-render';

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

ruleTester.run('no-conditional-logic-in-component-render', rule, {
  valid: [
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
      export default function MyComponent(props) {
        useEffect(()=>{
          if (x > 5){
            return foo;
          }
        }, [])
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
        if (x > 5) return <div />;
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
      export default function MyComponent(props) {
        if (x > 5) return <div />;
        return (
            <div />
        );
      }
    `,
      errors: ['Conditional logic inside components is invalid'],
    },
  ],
});
