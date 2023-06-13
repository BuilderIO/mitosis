import { filesystem, system } from 'gluegun';
import * as path from 'path';
import { expect, test } from 'vitest';

const { version } = require('../../package.json');

const root = filesystem.path(__dirname, '..', '..');
const script = filesystem.path(root, 'bin', 'mitosis');

const cli = async (cmd: string) => {
  const shcmd = `node ${script} ${cmd}`;
  console.debug(`Running: ${shcmd}`);
  return system.run(shcmd);
};

test('outputs version', async () => {
  const output = await cli('--version');
  expect(output).toContain(version);
});

test('outputs help', async () => {
  const output = await cli('--help');
  expect(output).toContain(version);
});

// TODO refactor commands/compile.ts to not have side effects (like calling
// process.exit) so that this can be unit tested instead.
test('strips out builder components by default', async () => {
  const filepath = path.resolve(__dirname, 'data/triptych.builder.json');

  const output = await cli(`compile --from=builder --to=react ${filepath}`);

  expect(output).toMatchSnapshot();
  expect(output).toContain('function MyComponent(props) {');
  expect(output).not.toContain('<Columns');
  expect(output).not.toContain('<Column');
  expect(output).not.toContain('<Image');
  expect(output).toContain('<img');
});

test('--builder-components keeps builder components', async () => {
  const filepath = path.resolve(__dirname, 'data/triptych.builder.json');

  const output = await cli(`compile --builder-components --from=builder --to=react ${filepath}`);

  expect(output).toMatchSnapshot();
  expect(output).toContain('function MyComponent(props) {');
  expect(output).toContain('<Columns');
  expect(output).toContain('<Column');
  expect(output).toContain('<Image');
  expect(output).not.toContain('<img');
});
