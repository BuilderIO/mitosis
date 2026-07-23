import { RuleTester } from 'eslint';
import rule from '../no-ternary-operator-in-jsx-return-body';

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

var ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
});

ruleTester.run('no-ternary-operator-in-jsx-return-body', rule, {
  valid: [
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return (
          <div>
            <Show when={foo}>
              <bar />
            </Show>
            <Show when={!foo}>
              <baz />
            </Show>
          </div>
        );
      }
    `,
    },
    {
      ...opts,
      code: `export default function MyComponent(props) {
      const state = useState({ 
        getName() {
          props.a ? 'a' : 'b'
        } 
      })
      return <div />;
    }`,
    },
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return <div> <input value={props.a ? 'a' : 'b'} /> </div>;
      }`,
    },
    {
      ...opts,
      code: `
      export default function MyComponent(props) {
        return <div>{foo ? <bar /> : <baz />}</div>;
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
        return <div>{foo ? <bar /> : <baz />}</div>;
      }
    `,
      output: `import { Show } from '@builder.io/mitosis';

      export default function MyComponent(props) {
        return <div><Show when={foo} else={<baz />}>{<bar />}</Show></div>;
      }
    `,
      errors: [
        'Ternary expression support is minimal. Please use the Mitosis `<Show>` component instead.',
      ],
    },
  ],
});
