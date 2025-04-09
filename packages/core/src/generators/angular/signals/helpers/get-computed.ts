import { hashCodeAsString } from '@/symbols/symbol-processor';
import type { MitosisComponent } from '@/types/mitosis-component';
import type { Binding } from '@/types/mitosis-node';
import { pickBy } from 'lodash';

export const getComputedGetters = ({ json }: { json: MitosisComponent }) => {
  const getterKeys = Object.keys(pickBy(json.state, (i) => i?.type === 'getter'));

  if (!getterKeys.length) {
    return '';
  }

  return getterKeys
    .map((key) => {
      const code = json.state[key]?.code?.toString();
      if (!code) {
        return '';
      }

      // Transform `get foo() { return this.bar }` to `foo = computed(() => { return bar.value })`
      const getterAsFunction = code
        .replace('get', '')
        .replace(key, '')
        .trim()
        .replace(/^\(\)/, '() =>');

      return `${key} = computed(${getterAsFunction})`;
    })
    .filter(Boolean)
    .join('\n');
};

export const createObjectSpreadComputed = (
  json: MitosisComponent,
  binding: Binding,
  key: string,
): string => {
  const computedName = `objSpread_${key}_${hashCodeAsString(binding.code)}`;

  // creates a getter that gets converted to Angular's computed
  json.state[computedName] = {
    code: `get ${computedName}() { return ${binding.code} }`,
    type: 'getter',
  };

  return computedName;
};
