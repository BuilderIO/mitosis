import { RuleTester } from 'eslint';
import rule from '../no-assign-props-to-state';

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

ruleTester.run('no-assign-props-to-state', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      export default function MyComponent(props) {
        const state = useStore({ text: null });

        onMount(() => {
          state.text = props.text;
        });
      }
      `,
    },
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      import { foo } from '../helpers';

      export default function MyComponent(props) {
        const state = useStore({ 
          text: null,
          fn1() {
            return foo(props.text);
          },
          fn2() {
            return foo({ text: props.text });
          }
        });

        onMount(() => {
          state.text = props.text;
        });
      }
      `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const state = useStore({ text: props.text });
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
      export default function MyComponent(props) {
        const state = useStore({ text: props.text });
      }
      `,
      errors: ['"props" can\'t be assign to  to "state" directly'],
    },
  ],
});
