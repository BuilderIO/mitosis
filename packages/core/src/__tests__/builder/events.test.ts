import { componentToBuilder } from '@/generators/builder';
import { parseJsx } from '@/parsers/jsx';
import { describe, test } from 'vitest';

describe('Builder Events', () => {
  test('no data loss occurs when parsing and generating symbols', () => {
    const mitosis = parseJsx(`
    export default function MyComponent(props) {
      return (
        <button onClick={state.foo}>Click Me</button>
      );
    }
    `);

    const builderJson = componentToBuilder()({ component: mitosis });
    expect(builderJson.data!.blocks![0].actions).toMatchInlineSnapshot(`
      {
        "click": "state.foo()",
      }
    `);
  });
});
