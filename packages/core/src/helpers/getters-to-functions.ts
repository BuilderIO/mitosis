import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import traverse from 'traverse';

/**
 * Map getters like `useState({ get foo() { ... }})` from `state.foo` to `foo()`
 */
export const gettersToFunctions = (json: JSXLiteComponent) => {
  const getterKeys = Object.keys(json.state).filter((item) => {
    const value = json.state[item];
    if (
      typeof value === 'string' &&
      value.startsWith(methodLiteralPrefix) &&
      value.replace(methodLiteralPrefix, '').startsWith('get ')
    ) {
      return true;
    }
    return false;
  });

  console.log('getterKeys', getterKeys);

  traverse(json).forEach(function (item) {
    // TODO: not all strings are expressions!
    if (typeof item === 'string') {
      let value = item;
      for (const key of getterKeys) {
        try {
          value = value.replace(
            new RegExp(`state\\s*\\.\\s*${key}([^a-z0-9]|$)`, 'gi'),
            (match, group1) => {
              console.log('matched', match);

              if (match.endsWith('?')) {
                return `${key}?.()${group1}`;
              }

              return `${key}()${group1}`;
            },
          );
        } catch (err) {
          console.error('Could not update getter ref', err);
        }
      }
      if (value !== item) {
        this.update(value);
      }
    }
  });
};
