import { RuleTester } from 'eslint';
import rule from '../no-var-declaration-or-assignment-in-component';

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

ruleTester.run('no-var-declaration-or-assignment-in-component', rule, {
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
    // accepts declaration inside hooks.
    {
      ...opts,
      code: `
      export default function MyComponent(props) {

        useEffect(()=>{
          const a = b;
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
      import x from "y";

      export default function MyComponent(props) {
        const context = useContext(x)

        const state = useStore({ name: null })

        return (
            <div />
        );
      }
    `,
    },
    {
      ...opts,
      code: `
      import x from "y";

      export default function MyComponent(props) {
        const ref = useRef(x)

        return (
            <div />
        );
      }
    `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
          export default function MyComponent(props) {
            const a = b;
            
            return (
                <div />
            );
          }
        `,
      filename: 'file.jsx',
    },
  ],
  invalid: [
    // Doesn't accept variable declaration inside component
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        const a = b;
        
        return (
            <div />
        );
      }
    `,
      errors: ['Variable declaration inside component is ignored during compilation'],
    },
    // Doesn't accept variable assignment inside component
    {
      ...opts,
      code: `
      let a;
      export default function MyComponent(props) {
        a = b;
        
        return (
            <div />
        );
      }
    `,
      errors: ['Variable assignment inside component is ignored during compilation'],
    },
    // Doesn't accept variable declaration and assignment inside component
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        let a;
        a = b;
        
        return (
            <div />
        );
      }
    `,
      errors: [
        'Variable declaration inside component is ignored during compilation',
        'Variable assignment inside component is ignored during compilation',
      ],
    },
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        let a;
        a = b;
        
        return (
            <div />
        );
      }
    `,
      errors: [
        'Variable declaration inside component is ignored during compilation',
        'Variable assignment inside component is ignored during compilation',
      ],
    },
  ],
});
