import { babelTransformExpression } from '@/helpers/babel-transform';
import { hashCodeAsString } from '@/symbols/symbol-processor';
import type { MitosisComponent } from '@/types/mitosis-component';
import type { Binding } from '@/types/mitosis-node';
import { isIdentifier, isMemberExpression } from '@babel/types';
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
  isForContext: boolean = false,
  forName: string = '',
  indexName: string = '',
): string => {
  const computedName = `objSpread_${key}_${hashCodeAsString(binding.code)}`;

  const transformedCode = babelTransformExpression(binding.code, {
    MemberExpression(path) {
      if (
        isMemberExpression(path.node) &&
        isIdentifier(path.node.object) &&
        isIdentifier(path.node.property) &&
        (path.node.object.name === 'props' || path.node.object.name === 'state') &&
        !path.node.extra?.processed
      ) {
        path.node.object.name = 'this';
        path.node.extra = { ...path.node.extra, processed: true };
        const code = path.toString();
        path.replaceWithSourceString(`${code}()`);
      }
    },
  });

  const finalCode = transformedCode
    // Replace props.x.y with this.x().y
    .replace(/\bprops\.(\w+)(\.\w+|\?\.\w+|\[.*?\])/g, (match, prop, rest) => {
      return `this.${prop}()${rest}`;
    })
    // Replace state.x.y with this.x().y
    .replace(/\bstate\.(\w+)(\.\w+|\?\.\w+|\[.*?\])/g, (match, prop, rest) => {
      return `this.${prop}()${rest}`;
    });

  if (isForContext && (forName || indexName)) {
    // Create a method that accepts the for loop context variables
    const params = [];
    if (forName) params.push(forName);
    if (indexName) params.push(indexName);

    json.state[computedName] = {
      code: `${computedName}(${params.join(', ')}) { return ${finalCode} }`,
      type: 'method',
    };
  } else {
    // Creates a getter that gets converted to Angular's computed
    json.state[computedName] = {
      code: `get ${computedName}() { return ${finalCode} }`,
      type: 'getter',
    };
  }

  return computedName;
};
