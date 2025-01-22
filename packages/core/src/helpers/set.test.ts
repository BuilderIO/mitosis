import { set } from './set.js';

test('can shallow set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo', 'baz');
  expect(obj.foo).toBe('baz');
});

test('can deeply set a property', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar', 'baz');
  expect((obj.foo as any).bar).toBe('baz');
});

test('can deeply create arrays', () => {
  const obj = { foo: 'bar' };
  set(obj, 'foo.bar.0', 'hi');
  expect((obj.foo as any).bar).toEqual(['hi']);
});
