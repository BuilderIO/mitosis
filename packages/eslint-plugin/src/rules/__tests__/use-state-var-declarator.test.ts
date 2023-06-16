import { RuleTester } from 'eslint';
import rule from '../use-state-var-declarator';

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

ruleTester.run('use-state-var-declarator', rule, {
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
        const state = useStore();
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
        const [name, setName] = useState();
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
        const foo = useStore();
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
        const a = useStore();
        
        return (
            <div />
        );
      }
    `,
      errors: ['useStore should be exclusively assigned to a variable called state'],
    },
  ],
});
