import { hashCodeAsString } from '..';

describe('hashCode', () => {
  test('should compute object', () => {
    expect(hashCodeAsString({ foo: 'bar' })).toEqual('1jo4fm');
  });

  test('order of properties should not matter', () => {
    expect(hashCodeAsString({ a: 'first', b: 'second' })).toEqual(
      hashCodeAsString({ b: 'second', a: 'first' }),
    );
  });
});
