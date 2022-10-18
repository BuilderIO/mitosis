import dedent from 'dedent';
import json5 from 'json5';
import { pickBy } from 'lodash';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { MitosisComponent, extendedHook } from '../../types/mitosis-component';
import { types } from '@babel/core';
import { processBinding } from './helpers';
import { ToVueOptions } from './types';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';

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

function shouldAppendValueToRef(path: babel.NodePath<babel.types.Identifier>) {
  const { parent, node } = path;

  if (types.isFunctionDeclaration(parent) && parent.id === node) {
    return false;
  }

  if (types.isCallExpression(parent)) {
    return false;
  }

  const isMemberExpression = types.isMemberExpression(parent);

  if (
    isMemberExpression &&
    types.isThisExpression(parent.object) &&
    types.isProgram(path.scope.block) &&
    path.scope.hasReference(node.name)
  ) {
    return false;
  }

  if (
    isMemberExpression &&
    types.isIdentifier(parent.object) &&
    types.isIdentifier(parent.property) &&
    parent.property.name === node.name
  ) {
    return false;
  }

  if (Object.keys(path.scope.bindings).includes(path.node.name)) {
    return false;
  }

  if (path.parentPath.listKey === 'arguments' || path.parentPath.listKey === 'params') {
    return false;
  }

  return true;
}

export function appendValueToRefs(
  input: string,
  component: MitosisComponent,
  options: ToVueOptions,
) {
  const refKeys = Object.keys(component.refs);
  const stateKeys = Object.keys(pickBy(component.state, (i) => i?.type === 'property'));
  const allKeys = [...refKeys, ...stateKeys];

  let output = processBinding({ code: input, options, json: component, includeProps: false });

  return babelTransformExpression(output, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      if (allKeys.includes(path.node.name) && shouldAppendValueToRef(path)) {
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
    ${component.hooks.onInit?.code ?? ''}
    ${!component.hooks.onMount?.code ? '' : `onMounted(() => { ${component.hooks.onMount.code}})`}
    ${
      !component.hooks.onUnMount?.code
        ? ''
        : `onMounted(() => { ${component.hooks.onUnMount.code}})`
    }
    ${
      getterKeys
        ?.map((key) => {
          const code = component.state[key]?.code?.toString();
          return !code
            ? ''
            : `const ${key} = computed(${appendValueToRefs(
                code.replace(key, '').replace('get ()', '() =>'),
                component,
                options,
              )})`;
        })
        .join('\n') || ''
    }

    ${onUpdateWithoutDeps?.map((hook) => `onUpdated(() => ${hook.code})`).join('\n') || ''}

    ${
      onUpdateWithDeps
        ?.map(
          (hook) =>
            `watch(${hook.deps}, (${stripStateAndPropsRefs(hook.deps)}) => { ${hook.code} })`,
        )
        .join('\n') || ''
    }
    ${methods?.length ? appendValueToRefs(methods, component, options) : ''}
  `;

  str = str.replace(/this\./g, ''); // strip this elsewhere (e.g. functions)
  return str;
}
