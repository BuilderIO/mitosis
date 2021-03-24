/**
 * Remove the surrounding block for a function, for instance
 *
 * `{ const foo = "bar" }` -> `const foo = "bar"`
 */
export function removeSurroundingBlock(code: string) {
  let str = code;
  // Object literal like { foo: ... } should not be unwrapped
  if (str.match(/^\s*{\s*[a-z0-9]+:/i)) {
    return str;
  }

  // Empty object literal
  if (str.replace(/\s+/g, '') === '{}') {
    return str;
  }

  const bracesRegex = /^\s*\{([\s\S]+)\}\s*$/;
  if (bracesRegex.test(str)) {
    return str.replace(bracesRegex, '$1');
  }
  return str;
}
