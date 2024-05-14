import { RuleTester } from 'eslint';
import rule from '../no-setter-with-same-name-as-state-prop';

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

ruleTester.run('no-setter-with-same-name-as-state-prop', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useStore } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useStore({
          nameFoo: 'foo',
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
import { useState } from "@builder.io/mitosis";
import { x } from 'lodash'

export default function MyComponent(props) {
  const state = useStore({
    a: 123,
    b: { c: 'fdsa' },
    foo: "Steve",
    setFoo(x) {
      state.foo = x;
    }
  });

  return (
    <div>
      <input
        css={{
          color: "red",
        }}
        value={x(name)}
        onChange={(event) => setName(event.target.value)}
      />
      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
    </div>
  );
}
      `,
      errors: [
        'Cannot name a state property `setFoo` because of a collision with Mitosis-generated code for the state property `foo`. Please use a different name.',
      ],
    },
  ],
});
