import json5 from 'json5';
import { uniq, kebabCase, size } from 'lodash';
import { getComponentsUsed } from '../../helpers/get-components-used';
import { getCustomImports } from '../../helpers/get-custom-imports';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { checkIsDefined } from '../../helpers/nullable';
import { checkIsComponentImport } from '../../helpers/render-imports';
import { MitosisComponent, extendedHook } from '../../types/mitosis-component';
import { PropsDefinition, DefaultProps } from 'vue/types/options';
import { encodeQuotes, getContextProvideString, getOnUpdateHookName } from './helpers';
import { ToVueOptions } from './types';

function getContextInjectString(component: MitosisComponent, options: ToVueOptions) {
  let str = '{';

  for (const key in component.context.get) {
    str += `
      ${key}: ${encodeQuotes(component.context.get[key].name)},
    `;
  }

  str += '}';
  return str;
}

const generateComponentImport =
  (options: ToVueOptions) =>
  (componentName: string): string => {
    if (options.vueVersion >= 3 && options.asyncComponentImports) {
      return `'${componentName}': defineAsyncComponent(${componentName})`;
    } else {
      return `'${componentName}': ${componentName}`;
    }
  };

const generateComponents = (componentsUsed: string[], options: ToVueOptions): string => {
  if (componentsUsed.length === 0) {
    return '';
  } else {
    return `components: { ${componentsUsed.map(generateComponentImport(options)).join(',')} },`;
  }
};

const appendToDataString = ({
  dataString,
  newContent,
}: {
  dataString: string;
  newContent: string;
}) => dataString.replace(/}$/, `${newContent}}`);

export function generateOptionsApiScript(
  component: MitosisComponent,
  options: ToVueOptions,
  path: string | undefined,
  template: string,
  props: string[],
  onUpdateWithDeps: extendedHook[],
  onUpdateWithoutDeps: extendedHook[],
) {
  const { exports: localExports } = component;
  const localVarAsData: string[] = [];
  const localVarAsFunc: string[] = [];
  if (localExports) {
    Object.keys(localExports).forEach((key) => {
      if (localExports[key].usedInLocal) {
        if (localExports[key].isFunction) {
          localVarAsFunc.push(key);
        } else {
          localVarAsData.push(key);
        }
      }
    });
  }

  let dataString = getStateObjectStringFromComponent(component, {
    data: true,
    functions: false,
    getters: false,
  });

  // Append refs to data as { foo, bar, etc }
  dataString = appendToDataString({
    dataString,
    newContent: getCustomImports(component).join(','),
  });

  if (localVarAsData.length) {
    dataString = appendToDataString({ dataString, newContent: localVarAsData.join(',') });
  }

  const getterString = getStateObjectStringFromComponent(component, {
    data: false,
    getters: true,
    functions: false,
  });

  let functionsString = getStateObjectStringFromComponent(component, {
    data: false,
    getters: false,
    functions: true,
  });

  const includeClassMapHelper = template.includes('_classStringToObject');

  if (includeClassMapHelper) {
    functionsString = functionsString.replace(
      /}\s*$/,
      `_classStringToObject(str) {
        const obj = {};
        if (typeof str !== 'string') { return obj }
        const classNames = str.trim().split(/\\s+/);
        for (const name of classNames) {
          obj[name] = true;
        }
        return obj;
      }  }`,
    );
  }

  if (localVarAsFunc.length) {
    functionsString = functionsString.replace(/}\s*$/, `${localVarAsFunc.join(',')}}`);
  }

  // Component references to include in `component: { YourComponent, ... }
  const componentsUsedInTemplate = Array.from(getComponentsUsed(component))
    .filter((name) => name.length && !name.includes('.') && name[0].toUpperCase() === name[0])
    // Strip out components that compile away
    .filter((name) => !['For', 'Show', 'Fragment', 'Slot', component.name].includes(name));

  // get default imports from component files
  const importedComponents = component.imports
    .filter(checkIsComponentImport)
    .map((imp) => Object.entries(imp.imports).find(([_, value]) => value === 'default')?.[0])
    .filter(checkIsDefined);

  const componentsUsed = uniq([...componentsUsedInTemplate, ...importedComponents]);

  let propsDefinition: PropsDefinition<DefaultProps> = Array.from(props).filter(
    (prop) => prop !== 'children' && prop !== 'class',
  );

  // add default props (if set)
  if (component.defaultProps) {
    propsDefinition = propsDefinition.reduce(
      (propsDefinition: DefaultProps, curr: string) => (
        (propsDefinition[curr] = component.defaultProps?.hasOwnProperty(curr)
          ? { default: component.defaultProps[curr] }
          : {}),
        propsDefinition
      ),
      {},
    );
  }

  return `
        export default {
        ${
          !component.name
            ? ''
            : `name: '${
                path && options.namePrefix?.(path) ? options.namePrefix?.(path) + '-' : ''
              }${kebabCase(component.name)}',`
        }
        ${generateComponents(componentsUsed, options)}
        ${props.length ? `props: ${json5.stringify(propsDefinition)},` : ''}
        ${
          dataString.length < 4
            ? ''
            : `
        data: () => (${dataString}),
        `
        }

        ${
          size(component.context.set)
            ? `provide() {
                return ${getContextProvideString(component, options)}
              },`
            : ''
        }
        ${
          size(component.context.get)
            ? `inject: ${getContextInjectString(component, options)},`
            : ''
        }
        ${
          component.hooks.onInit?.code
            ? `created() {
                ${component.hooks.onInit.code}
              },`
            : ''
        }
        ${
          component.hooks.onMount?.code
            ? `mounted() {
                ${component.hooks.onMount.code}
              },`
            : ''
        }
        ${
          onUpdateWithoutDeps.length
            ? `updated() {
            ${onUpdateWithoutDeps.map((hook) => hook.code).join('\n')}
          },`
            : ''
        }
        ${
          onUpdateWithDeps.length
            ? `watch: {
            ${onUpdateWithDeps
              .map(
                (hook, index) =>
                  `${getOnUpdateHookName(index)}() {
                  ${hook.code}
                  }
                `,
              )
              .join(',')}
          },`
            : ''
        }
        ${
          component.hooks.onUnMount
            ? `unmounted() {
                ${component.hooks.onUnMount.code}
              },`
            : ''
        }

        ${
          getterString.length < 4
            ? ''
            : ` 
          computed: ${getterString},
        `
        }
        ${
          functionsString.length < 4
            ? ''
            : `
          methods: ${functionsString},
        `
        }
        ${Object.entries(component.meta.vueConfig || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(',')}
      }`;
}
