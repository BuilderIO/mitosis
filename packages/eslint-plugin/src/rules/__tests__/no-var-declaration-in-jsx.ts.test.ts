import { RuleTester } from 'eslint';
import rule from '../no-var-declaration-in-jsx';

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

ruleTester.run('no-var-declaration-in-jsx', rule, {
  valid: [
    // Doesn't affect map with no variable declaration inside.
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
            <div>
              {a.map(x =>{
                return <span>{x}</span>
              })}
            </div>
        );
      }
    `,
    },
    // Doesn't affect variable declaration inside JSX attributes.
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
            <div someProp={a.find(b => {
              const {x} = b;
              return x < 1;
            })} />
        );
      }
    `,
    },
    // Doesn't affect none Mitosis files.
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
            <div>
              {a.map(x =>{
                const foo = "bar";
                return <span>{x}</span>
              })}
            </div>
        );
      }
    `,
      filename: 'file.jsx',
    },
  ],
  invalid: [
    // Doesn't accept variable declaration inside map.
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
            <div>
              {a.map(x =>{
                const foo = "bar";
                return <span>{x}</span>
              })}
            </div>
        );
      }
    `,
      errors: ['Variable declaration inside jsx is ignored during compilation'],
    },
  ],
});
