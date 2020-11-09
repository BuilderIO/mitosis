import { componentToReact } from '../generators/react';
import { parse } from '../parse';

test('React full', () => {
  const json = parse(
    `
      import { useState } from '@jsx-lite/core';
      import foo, { someLib } from 'some-lib';
  
      export default function MyComponent() {
        const state = useState({
          name: 'Steve',
        });
  
        return (
          <div>
            <input
              value={state.name}
              onChange={(event) => (state.name = event.target.value)}
            />
            Hello! I can run in React, Vue, Solid, or Liquid!
          </div>
        );
      }
    `,
  );

  const output = componentToReact(json);

  expect(output).toMatchSnapshot();

  console.log('output', output);
});
