import { describe, expect, test } from 'vitest';
import { componentToQwik, parseJsx } from '..';

/**
 * this test is for local development only, to conveniently iterate on one file/one generator.
 */

// ignore this in CI
if (process.env.CI) {
  test.skip('file', () => {});
}

const getRawFile = async (filePath: string) => {
  const code = await import(`${filePath}?raw`).then((x) => x.default as string);
  return { code, filePath: ['src', '__tests__', filePath].join('/') };
};

const file = getRawFile('./data/blocks/getter-state.raw.lite.tsx');

describe('LOCAL', () => {
  test('file', async () => {
    const { code, filePath } = await file;
    const mitosisJSON = await parseJsx(code);

    const output = componentToQwik({})({
      component: mitosisJSON,
      path: filePath,
    });

    expect(mitosisJSON).toMatchSnapshot();
    expect(output).matchSnapshot();
  });
});
