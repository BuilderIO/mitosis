import { RuleTester } from 'eslint';
import rule from '../no-map-function-in-jsx-return-body';

const opts = {
  filename: 'component.lite.tsx',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
} as const;

var ruleTester = new RuleTester();

ruleTester.run('no-map-function-in-jsx-return-body', rule, {
  valid: [
    {
      ...opts,
      code: `
            import { useStore, For, onMount } from '@builder.io/mitosis';

            export default function MyBasicForComponent() {
              const state = useStore({
                name: 'Decadef20',
                names: ['Steve', 'Decadef20'],
              });
            
              onMount(() => {
                console.log('onMount code');
              });
            
              return (
                <div>
                  <For each={state.names}>
                    {(person) => (
                      <>
                        <input
                          value={state.name}
                          onChange={(event) => {
                            state.name = event.target.value + ' and ' + person;
                          }}
                        />
                        Hello {person}! I can run in Qwik, Web Component, React, Vue, Solid, or Liquid!
                      </>
                    )}
                  </For>
                </div>
              );
            }
            
            `,
    },
  ],
  invalid: [
    {
      ...opts,
      code: `
      export default function MyComponent() {
        
        return <div> {[].map()} </div>
      }
      `,
      errors: ['No map function in jsx return body. Please use <For /> component instead.'],
    },
  ],
});
