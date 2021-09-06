import { transpileBindingExpression } from './transpile-vue-binding-expression'

export function transpileOptionalChaining(template: string): string {
  return (
    // TODO: use proper HTMl parsing of vue instead of regexes. Slower
    // but more reliable for real attribute values
    template
      // Transpile out the ?. operator which Vue 2 templates don't support
      // Special match for v-for as it doesn't use normal JS syntax at the
      // start of it
      .replace(
        /v-for="(.+?) in ([^"]+?)"/g,
        (_match, group1, group2) =>
          `v-for="${group1} in ${transpileBindingExpression(group2)}"`
      )
      // Transpile out the ?. operator which Vue 2 templates don't support
      .replace(
        /="([^"]*?\?\.[^"]*?)"/g,
        (_match, group) => `="${transpileBindingExpression(group)}"`
      )
  )
}
