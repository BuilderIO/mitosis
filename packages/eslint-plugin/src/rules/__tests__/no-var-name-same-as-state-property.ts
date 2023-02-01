import { RuleTester } from 'eslint';
import rule from '../no-var-name-same-as-state-property';

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

ruleTester.run('no-var-name-same-as-state-property', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      export default function MyComponent(props) {
        const state = useStore({
            foo: "bar"
          })
          const foo_ = bar;
        return (
          <div />
        );
      }
      `,
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
          const { foo: foo1 } = props.obj
          state.foo = foo;
        }
        return <div />;
      }
      `,
    },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';
      export default function MyComponent(props) {
        const state = useStore({
            foo: "bar"
          })
          const foo = bar;
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
      import { useStore } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const state = useStore({
            foo: "bar"
          })

          const foo = bar;

        return (
          <div />
        );
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
    },
    {
      ...opts,
      code: `
      import { useStore } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        const state = useStore({
          foo: 'bar',

          abc() {
            const foo = 'baz';

            return foo;
          }
        });

        return <div />;
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
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
          const foo = 'some value';
          state.foo = foo;
        }

        return <div />;
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
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
          const { foo } = props.obj

          state.foo = foo;
        }

        return <div />;
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
    },
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          response: 'null',
          saveResponse(response) {
            state.response = response;
          },
        });

        return (
          <div>
            Hello
          </div>
        );
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
    },
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          response: 'null',
          saveResponse() {
            const bar = (response) => {
              return response;
            }
          },
        });

        return (
          <div>
            Hello
          </div>
        );
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
    },
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          response: 'null',
          saveResponse() {
      
            function baz(response) {
              return response
            }

          },
        });
      
        return (
          <div>
            Hello
          </div>
        );
      }
      `,
      errors: ['variables with the same name as a state property will shadow it'],
    },
  ],
});
