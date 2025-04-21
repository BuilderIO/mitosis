import { componentToSwift } from '@/generators/swift';
import { parseJsx } from '@/parsers/jsx';
import { runTestsForTarget } from './test-generator';

describe('swift', () => {
  runTestsForTarget({ options: {}, target: 'swift', generator: componentToSwift });

  it('should generate the correct code with styles', () => {
    const jsx = `
      export default function MyComponent() {
        return (
          <div css={{ color: 'red', padding: '10px' }}>
            Hello world
          </div>
        )
      }
    `;

    const code = componentToSwift()({ component: parseJsx(jsx) });
    expect(code).toMatchSnapshot();
  });
});
