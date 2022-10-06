import dedent from 'dedent';
import json5 from 'json5';
import { pickBy } from 'lodash';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { MitosisComponent, extendedHook } from '../../types/mitosis-component';
import { types } from '@babel/core';
import { processBinding } from './helpers';
import { ToVueOptions } from './types';

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
    str += `withDefaults(defineProps${generic}(), ${json5.stringify(component.defaultProps)})`;
  } else if (options.typescript && component.propsTypeRef && component.propsTypeRef !== 'any') {
    str += `defineProps<${component.propsTypeRef}>()`;
  } else {
    str += `defineProps(${json5.stringify(props)})`;
  }
  return str;
};
function appendValueToRefs(input: string, component: MitosisComponent, options: ToVueOptions) {
  const refKeys = Object.keys(pickBy(component.state, (i) => i?.type === 'property'));

  let output = processBinding({ code: input, options, json: component, includeProps: false });

  return babelTransformExpression(output, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      if (
        !(types.isFunctionDeclaration(path.parent) && path.parent.id === path.node) &&
        !types.isCallExpression(path.parent) &&
        (!types.isMemberExpression(path.parent) || types.isThisExpression(path.parent.object)) &&
        path.parentPath.listKey !== 'arguments' &&
        path.parentPath.listKey !== 'params' &&
        refKeys.includes(path.node.name)
      ) {
        path.replaceWith(types.identifier(`${path.node.name}.value`));
      }
    },
  });
}

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
    valueMapper: (code) => {
      return processBinding({ code: `ref(${code})`, options, json: component });
    },
    keyPrefix: 'const',
  });

  let methods = getStateObjectStringFromComponent(component, {
    data: false,
    getters: false,
    functions: true,
    valueMapper: (code) => processBinding({ code, options, json: component, includeProps: false }),
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

    ${Object.keys(component.context.get)
      ?.map((key) => `const ${key} = inject(${component.context.get[key].name})`)
      .join('\n')}

    ${Object.keys(component.context.set)
      ?.map(
        (key) => `provide(${component.context.set[key].name}, ${component.context.set[key].ref})`,
      )
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
    ${appendValueToRefs(component.hooks.onInit?.code ?? '', component, options)}
    ${
      !component.hooks.onMount?.code
        ? ''
        : `onMounted(() => { ${appendValueToRefs(
            component.hooks.onMount.code,
            component,
            options,
          )}})`
    }
    ${
      !component.hooks.onUnMount?.code
        ? ''
        : `onMounted(() => { ${appendValueToRefs(
            component.hooks.onUnMount.code,
            component,
            options,
          )}})`
    }
    ${
      !getterKeys
        ? ''
        : getterKeys
            .map((key) => {
              const code = component.state[key]?.code?.toString();
              return !code
                ? ''
                : `const ${key} = computed(${appendValueToRefs(
                    code.replace(key, '').replace('get ()', '() =>'),
                    component,
                    options,
                  )})`;
            })
            .join('\n')
    }
    ${
      !onUpdateWithoutDeps?.length
        ? ''
        : onUpdateWithoutDeps.map((hook) => {
            return `onUpdated(() => ${appendValueToRefs(hook.code, component, options)})`;
          })
    }

    ${
      !onUpdateWithDeps?.length
        ? ''
        : onUpdateWithDeps.map((hook) => {
            return appendValueToRefs(
              `watch(${hook.deps}, (${stripStateAndPropsRefs(hook.deps)}) => { ${hook.code}})\n`,
              component,
              options,
            );
          })
    }
    ${methods?.length ? appendValueToRefs(methods, component, options) : ''}
  `;

  str = str.replace(/this\./g, ''); // strip this elsewhere (e.g. functions)
  return str;
}
