import { RuleTester } from 'eslint';
import rule from '../prefer-show-over-ternary-operator';

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

ruleTester.run('prefer-show-over-ternary-operator', rule, {
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
      errors: [
        'Ternary expression support is minimal. Please use the Mitosis `<Show>` component instead.',
      ],
    },
  ],
});
