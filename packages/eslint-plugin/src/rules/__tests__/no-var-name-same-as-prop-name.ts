import { RuleTester } from 'eslint';
import rule from '../no-var-name-same-as-prop-name';

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

ruleTester.run('no-var-name-same-as-prop-name', rule, {
  valid: [
    {
      ...opts,
      code: `
      import { useState } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useState({
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
      import { useState } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useState({
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

      export default function MyComponent(props) {
        const state = useState({
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
      import { useState } from "@builder.io/mitosis";

      export default function MyComponent(props) {
        const state = useState({
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
  ],
});
