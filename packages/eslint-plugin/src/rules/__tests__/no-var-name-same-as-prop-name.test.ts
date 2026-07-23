import { RuleTester } from 'eslint';
import rule from '../no-var-name-same-as-prop-name';

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

ruleTester.run('no-var-name-same-as-prop-name', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          getName() {
            const name = props.name_ || 'hello'
            return name + ' world'
          }
        });
      
        return (
          <div>
            {state.getName()}
          </div>
        );
      }
      `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          getName() {
            const name = props.name || 'hello'
            return name + ' world'
          }
        });
      
        return (
          <div>
            {state.getName()}
          </div>
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
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          getName() {
            const name = props.name
            return name + ' world'
          }
        });
      
        return (
          <div>
            {state.getName()}
          </div>
        );
      }
      `,
      errors: ['Variable name should not be same as prop name'],
    },
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          getName() {
            const name = props.name || 'hello'
            return name + ' world'
          }
        });
      
        return (
          <div>
            {state.getName()}
          </div>
        );
      }
      `,
      errors: ['Variable name should not be same as prop name'],
    },
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const state = useStore({
          foo: 'bar',
        });


        function myFunction() {
          const foo = props.foo;
        }
      
        return <div />;
      }
      `,
      errors: ['Variable name should not be same as prop name'],
    },
  ],
});
