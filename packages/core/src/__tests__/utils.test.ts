import { dashCase } from '../helpers/dash-case';

describe('Utils', () => {
  expect(dashCase('fooBar')).toBe('foo-bar');
});
