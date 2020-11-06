import { reduce, kebabCase } from 'lodash';

export function mapToCss(map: any, spaces = 2, important = false, uewNewLine = spaces > 1): string {
  return reduce(
    map,
    (memo, value, key) => {
      if (value && typeof value === 'object') {
        return memo + key + '{' + mapToCss(value) + '}';
      }
      return (
        memo +
        (value && value.trim()
          ? `${uewNewLine ? '\n' : ''}${' '.repeat(spaces)}${kebabCase(key)}: ${
              value + (important ? ' !important' : '')
            };`
          : '')
      );
    },
    ''
  );
}
