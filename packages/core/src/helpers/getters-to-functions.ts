import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';

/**
 * Map getters like `useStore({ get foo() { ... }})` from `state.foo` to `foo()`
 */
export const gettersToFunctions = (json: MitosisComponent) => {
  const getterKeys = Object.keys(json.state).filter((item) => json.state[item]?.type === 'getter');

  traverse(json).forEach(function (item) {
    // TODO: not all strings are expressions!
    if (typeof item === 'string') {
      let value = item;
      for (const key of getterKeys) {
        try {
          value = value.replace(
            new RegExp(`state\\s*\\.\\s*${key}([^a-z0-9]|$)`, 'gi'),
            (match, group1) => {
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
