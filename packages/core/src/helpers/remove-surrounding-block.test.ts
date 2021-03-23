import { removeSurroundingBlock } from './remove-surrounding-block';

describe('removeSurroundingBlock', () => {
  test('It removes the surrounding wrapper block', () => {
    const output = removeSurroundingBlock('{ const foo = "bar" }');
    expect(output).toBe(' const foo = "bar" ');
  });
});
