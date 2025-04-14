import { resolve } from 'path';
import { expect, test } from 'vitest';
import { buildCommand } from '../../commands/build';
import { DEFAULT_TEST_TIMEOUT } from '../utils';

const fileEndings: string[] = ['cjs', 'ts', 'json'];
const targets: string[] = ['angular', 'react', 'vue'];

fileEndings.forEach((ending) => {
  test(
    `test config ${ending}`,
    async () => {
      const filepath = resolve(__dirname, `mitosis.config.${ending}`);
      const config = await buildCommand({ configRelPath: filepath, options: {}, testConfig: true });
      config.targets.forEach((target: string) => {
        expect(targets.includes(target)).toBeTruthy();
      });
    },
    { timeout: DEFAULT_TEST_TIMEOUT },
  );
});
