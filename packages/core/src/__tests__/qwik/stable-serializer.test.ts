import { stableJSONserialize } from '../../generators/qwik/stable-serialize';

describe('stable-serializer', () => {
  test('is an expression', () => {
    expect(stableJSONserialize({})).toBe('{}');
    expect(stableJSONserialize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });
});
