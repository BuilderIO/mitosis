import { reduce, kebabCase } from 'lodash';
import { StringMap } from '../types/string-map';

export function mapToCss(
  map: StringMap,
  spaces = 2,
  important = false,
  uewNewLine = spaces > 1,
) {
  return reduce(
    map,
    (memo, value, key) => {
      return (
        memo +
        (value && value.trim()
          ? `${uewNewLine ? '\n' : ''}${' '.repeat(spaces)}${kebabCase(key)}: ${
              value + (important ? ' !important' : '')
            };`
          : '')
      );
    },
    '',
  );
}
