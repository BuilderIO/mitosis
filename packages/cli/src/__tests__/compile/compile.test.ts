import * as path from 'path';
import { expect, test } from 'vitest';
import { DEFAULT_TEST_TIMEOUT, cli } from '../utils';

// TODO refactor commands/compile.ts to not have side effects (like calling
// process.exit) so that this can be unit tested instead.
test(
  'strips out builder components by default',
  async () => {
    const filepath = path.resolve(__dirname, 'data/triptych.builder.json');

    const output = await cli(`compile --from=builder --to=react "${filepath}"`);

    expect(output).toMatchSnapshot();
    expect(output).toContain('function MyComponent(props) {');
    expect(output).not.toContain('<Columns');
    expect(output).not.toContain('<Column');
    expect(output).not.toContain('<Image');
    expect(output).toContain('<img');
  },
  { timeout: DEFAULT_TEST_TIMEOUT },
);

test(
  '--builder-components keeps builder components',
  async () => {
    const filepath = path.resolve(__dirname, 'data/triptych.builder.json');

    const output = await cli(
      `compile --builder-components --from=builder --to=react "${filepath}"`,
    );

    expect(output).toMatchSnapshot();
    expect(output).toContain('function MyComponent(props) {');
    expect(output).toContain('<Columns');
    expect(output).toContain('<Column');
    expect(output).toContain('<Image');
    expect(output).not.toContain('<img');
  },
  { timeout: DEFAULT_TEST_TIMEOUT },
);
