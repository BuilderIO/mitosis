import { transpileBindingExpression } from './transpile-vue-binding-expression'

test('Transforms binding expression optional member access', async () => {
  expect(await transpileBindingExpression('foo?.bar?.baz')).toEqual(
    // A little redundant, but effective for our needs
    '((foo && foo.bar) && (foo && foo.bar).baz)'
  )
})
