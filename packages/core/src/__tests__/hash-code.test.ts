import { hashCodeAsString } from '..';

describe('hashCode', () => {
  test('should compute object', () => {
    expect(hashCodeAsString({ foo: 'bar' })).toEqual('1jo4fm');
  });
});
