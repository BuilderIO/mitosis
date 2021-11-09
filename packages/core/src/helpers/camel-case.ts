import { capitalize } from './capitalize';

/**
 * This is a function similar to loadash `camelCase`, but it does not mess with capitalization.
 *
 * loadash: `camelCase('A-BC')` => "ABc"
 * this fn: `camelCase('A-BC')` => "ABC"
 *
 */
export function camelCase(text: string = ''): string {
  const parts = text.split('-');
  const first = parts.shift();
  return first + parts.map(capitalize).join('');
}
