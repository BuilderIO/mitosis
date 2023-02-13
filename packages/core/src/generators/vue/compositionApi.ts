import dedent from 'dedent';
import json5 from 'json5';
import { pickBy } from 'lodash';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent, extendedHook } from '../../types/mitosis-component';
import { getContextKey, getContextValue, hasSlotProps } from './helpers';
import { ToVueOptions } from './types';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { replaceSlotsInString } from '../../helpers/slots';
import { processBinding } from './helpers';

const getCompositionPropDefinition = ({
  options,
  component,
  props,
}: {
  options: ToVueOptions;
  component: MitosisComponent;
  props: string[];
}) => {
  let str = 'const props = ';

  if (component.defaultProps) {
    const generic = options.typescript ? `<${component.propsTypeRef}>` : '';
    const defalutPropsString = props
      .map((prop) => {
        const value = component.defaultProps!.hasOwnProperty(prop)
          ? component.defaultProps![prop]?.code
          : 'undefined';
        return `${prop}: ${value}`;
      })
      .join(',');
    str += `withDefaults(defineProps${generic}(), {${defalutPropsString}})`;
  } else if (options.typescript && component.propsTypeRef && component.propsTypeRef !== 'any') {
    str += `defineProps<${component.propsTypeRef}>()`;
  } else {
    str += `defineProps(${json5.stringify(props)})`;
  }
  return str;
};

export function generateCompositionApiScript(
  component: MitosisComponent,
  options: ToVueOptions,
  template: string,
  props: Array<string>,
  onUpdateWithDeps: extendedHook[],
  onUpdateWithoutDeps: extendedHook[],
) {
  let refs = getStateObjectStringFromComponent(component, {
    data: true,
    functions: false,
    getters: false,
    format: 'variables',
    valueMapper: (code, _, typeParameter) =>
      options.typescript && typeParameter ? `ref<${typeParameter}>(${code})` : `ref(${code})`,
    keyPrefix: 'const',
  });

  // TODO replace
  let methods = getStateObjectStringFromComponent(component, {
    data: false,
    getters: false,
    functions: true,
    format: 'variables',
  });

  if (template.includes('_classStringToObject')) {
    methods += ` function _classStringToObject(str) {
      const obj = {};
      if (typeof str !== 'string') { return obj }
      const classNames = str.trim().split(/\\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    } `;
  }

  const getterKeys = Object.keys(pickBy(component.state, (i) => i?.type === 'getter'));

  let str = dedent`
    ${props.length ? getCompositionPropDefinition({ component, props, options }) : ''}
    ${refs}

    ${hasSlotProps(component) ? 'const slots = useSlots()' : ''}

    ${Object.entries(component.context.get)
      ?.map(([key, context]) => {
        return `const ${key} = inject(${getContextKey(context)})`;
      })
      .join('\n')}

    ${Object.values(component.context.set)
      ?.map((contextSet) => {
        const contextValue = getContextValue({ json: component, options })(contextSet);
        const key = getContextKey(contextSet);

        return `provide(${key}, ${contextValue})`;
      })
      .join('\n')}

    ${Object.keys(component.refs)
      ?.map((key) => {
        if (options.typescript) {
          return `const ${key} = ref<${component.refs[key].typeParameter}>()`;
        } else {
          return `const ${key} = ref(null)`;
        }
      })
      .join('\n')}
    ${component.hooks.onInit?.code ?? ''}
    ${!component.hooks.onMount?.code ? '' : `onMounted(() => { ${component.hooks.onMount.code}})`}
    ${
      !component.hooks.onUnMount?.code
        ? ''
        : `onUnmounted(() => { ${component.hooks.onUnMount.code}})`
    }
    ${
      getterKeys
        ?.map((key) => {
          const code = component.state[key]?.code?.toString();
          // TODO replace
          // const code = replaceSlotsInString(
          //   component.state[key]?.code || '',
          //   (slotName) => `$slots.${slotName}`,
          // );

          if (!code) {
            return '';
          }

          // transform `foo() { return this.bar }` to `() => { return bar.value }`
          const getterAsFunction = code.replace(key, '').trim().replace(/^\(\)/, '() =>');

          const computedCode = `const ${key} = computed(${getterAsFunction})`;

          return computedCode;
        })
        .join('\n') || ''
    }

    ${onUpdateWithoutDeps?.map((hook) => `onUpdated(() => ${hook.code})`).join('\n') || ''}

    ${
      onUpdateWithDeps
        ?.map((hook) => {
          return `watch(() => ${processBinding({
            code: hook.deps || '',
            options,
            json: component,
          })}, (${stripStateAndPropsRefs(hook.deps)}) => { ${hook.code} }, {immediate: true})`;
        })
        .join('\n') || ''
    }
    ${methods ?? ''}
  `;

  return str;
}
