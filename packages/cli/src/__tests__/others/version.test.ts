import { expect, test } from 'vitest';
import { DEFAULT_TEST_TIMEOUT, cli } from '../utils';

const { version } = require('../../../package.json');

test(
  'outputs version',
  async () => {
    const output = await cli('--version');
    expect(output).toContain(version);
  },
  { timeout: DEFAULT_TEST_TIMEOUT },
);

test(
  'outputs help',
  async () => {
    const output = await cli('--help');
    expect(output).toContain(version);
  },
  { timeout: DEFAULT_TEST_TIMEOUT },
);
