import { reduce, size } from 'lodash';
import { StringMap } from '../interfaces/string-map';

// This list is not exhaustive of all HTML boolean attributes, but we can add more in the future if needed.
const booleanHTMLAttributes = new Set(['checked', 'disabled', 'selected']);

export function mapToAttributes(map: StringMap) {
  if (!size(map)) {
    return '';
  }
  return reduce(
    map,
    (memo, value, key) => {
      let attributeValue = ` ${key}="${value}"`;

      if (booleanHTMLAttributes.has(key) && value) {
        attributeValue = ` ${value}`;
      }

      return memo + attributeValue;
    },
    ''
  );
}
