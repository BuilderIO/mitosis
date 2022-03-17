import { RuleTester } from 'eslint';
import rule from '../ref-no-current';

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

ruleTester.run('ref-no-current', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useRef } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const inputRef = useRef();
        const myFn = ()=>{
          inputRef.focus();
        }
        return (
            <div />
        );
      }
      `,
    },
    {
      ...opts,
      code: `
      import { useRef } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const someRef = useRef();
        const myFn = ()=>{
          someRef = 1;
        }
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
      import { useRef } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const inputRef = useRef();
        const myFn = ()=>{
          inputRef.current.focus();
        }
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
      import { useRef } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const inputRef = useRef();
  
        const myFn = ()=>{
          inputRef.current.focus(); 
        }
  
        return (
            <div />
        );
      }
      `,
      errors: [
        'property "current" doesn\'t exists on refs. you can call methods directly on them e.g: inputRef.focus(), or assign them a value e.g: inputRef = 1;',
      ],
    },
    {
      ...opts,
      code: `
      import { useRef as useR } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const inputRef = useR();
  
        const myFn = ()=>{
          inputRef.current.focus(); 
        }
  
        return (
            <div />
        );
      }
      `,
      errors: [
        'property "current" doesn\'t exists on refs. you can call methods directly on them e.g: inputRef.focus(), or assign them a value e.g: inputRef = 1;',
      ],
    },
  ],
});
