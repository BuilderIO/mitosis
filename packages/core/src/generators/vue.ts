import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import {
  getMemberObjectString,
  getStateObjectStringFromComponent,
} from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { getProps } from '../helpers/get-props';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import traverse from 'traverse';
import { getComponentsUsed } from '../helpers/get-components-used';
import { kebabCase, size } from 'lodash';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { processHttpRequests } from '../helpers/process-http-requests';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import { GETTER } from '../helpers/patterns';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { OmitObj } from 'src/helpers/typescript';

function encodeQuotes(string: string) {
  return string.replace(/"/g, '&quot;');
}

export type VueVersion = 2 | 3;

interface VueVersionOpt {
  vueVersion: VueVersion;
}

export interface ToVueOptions extends BaseTranspilerOptions, VueVersionOpt {
  cssNamespace?: () => string;
  namePrefix?: (path: string) => string;
  asyncComponentImports?: boolean;
}

function getContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get);
}

const ON_UPDATE_HOOK_NAME = 'onUpdateHook';

const getOnUpdateHookName = (index: number) => ON_UPDATE_HOOK_NAME + `${index}`;

// TODO: migrate all stripStateAndPropsRefs to use this here
// to properly replace context refs
function processBinding(code: string, _options: ToVueOptions, json: MitosisComponent): string {
  return replaceIdentifiers(
    stripStateAndPropsRefs(code, {
      includeState: true,
      includeProps: true,

      replaceWith: 'this.',
    }),
    getContextNames(json),
    (name) => `this.${name}`,
  );
}

const NODE_MAPPERS: {
  [key: string]: ((json: MitosisNode, options: ToVueOptions) => string) | undefined;
} = {
  Fragment(json, options) {
    return json.children.map((item) => blockToVue(item, options)).join('\n');
  },
  For(json, options) {
    const keyValue = json.bindings.key || { code: 'index' };
    const forValue = `(${json.properties._forName}, index) in ${stripStateAndPropsRefs(
      json.bindings.each?.code,
    )}`;

    if (options.vueVersion === 3) {
      // TODO: tmk key goes on different element (parent vs child) based on Vue 2 vs Vue 3
      return `<template :key="${encodeQuotes(keyValue?.code || 'index')}" v-for="${encodeQuotes(
        forValue,
      )}">
        ${json.children.map((item) => blockToVue(item, options)).join('\n')}
      </template>`;
    }
    // Vue 2 can only handle one root element
    const firstChild = json.children.filter(filterEmptyTextNodes)[0];
    if (!firstChild) {
      return '';
    }
    firstChild.bindings.key = keyValue;
    firstChild.properties['v-for'] = forValue;
    return blockToVue(firstChild, options);
  },
  Show(json, options) {
    const ifValue = stripStateAndPropsRefs(json.bindings.when?.code);
    if (options.vueVersion === 3) {
      return `
      <template v-if="${encodeQuotes(ifValue)}">
        ${json.children.map((item) => blockToVue(item, options)).join('\n')}
      </template>
      ${
        !json.meta.else
          ? ''
          : `
        <template v-else>
          ${blockToVue(json.meta.else as any, options)}
        </template>
      `
      }
      `;
    }
    let ifString = '';
    // Vue 2 can only handle one root element
    const firstChild = json.children.filter(filterEmptyTextNodes)[0];
    if (firstChild) {
      firstChild.properties['v-if'] = ifValue;
      ifString = blockToVue(firstChild, options);
    }
    let elseString = '';
    const elseBlock = json.meta.else;
    if (isMitosisNode(elseBlock)) {
      elseBlock.properties['v-else'] = '';
      elseString = blockToVue(elseBlock, options);
    }

    return `
    ${ifString}
    ${elseString}
    `;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: { [key: string]: string | undefined } = {
  innerHTML: 'v-html',
};

// Transform <foo.bar key="value" /> to <component :is="foo.bar" key="value" />
function processDynamicComponents(json: MitosisComponent, _options: ToVueOptions) {
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name.includes('.')) {
        node.bindings.is = { code: node.name };
        node.name = 'component';
      }
    }
  });
}

function processForKeys(json: MitosisComponent, _options: ToVueOptions) {
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name === 'For') {
        const firstChild = node.children[0];
        if (firstChild && firstChild.bindings.key) {
          node.bindings.key = firstChild.bindings.key;
          delete firstChild.bindings.key;
        }
      }
    }
  });
}

const stringifyBinding =
  (node: MitosisNode) =>
  ([key, value]: [string, { code: string; arguments?: string[] } | undefined]) => {
    if (key === '_spread') {
      return '';
    } else if (key === 'class') {
      return ` :class="_classStringToObject(${stripStateAndPropsRefs(value?.code, {
        replaceWith: 'this.',
      })})" `;
      // TODO: support dynamic classes as objects somehow like Vue requires
      // https://vuejs.org/v2/guide/class-and-style.html
    } else {
      // TODO: proper babel transform to replace. Util for this
      const useValue = stripStateAndPropsRefs(value?.code);

      if (key.startsWith('on')) {
        const { arguments: cusArgs = ['event'] } = value!;
        let event = key.replace('on', '').toLowerCase();
        if (event === 'change' && node.name === 'input') {
          event = 'input';
        }
        const isAssignmentExpression = useValue.includes('=');
        // TODO: proper babel transform to replace. Util for this
        if (isAssignmentExpression) {
          return ` @${event}="${encodeQuotes(
            removeSurroundingBlock(
              useValue
                // TODO: proper reference parse and replacing
                .replace(new RegExp(`${cusArgs[0]}\\.`, 'g'), '$event.'),
            ),
          )}" `;
        } else {
          return ` @${event}="${encodeQuotes(
            removeSurroundingBlock(
              useValue
                // TODO: proper reference parse and replacing
                .replace(new RegExp(`${cusArgs[0]}`, 'g'), '$event'),
            ),
          )}" `;
        }
      } else if (key === 'ref') {
        return ` ref="${encodeQuotes(useValue)}" `;
      } else if (BINDING_MAPPERS[key]) {
        return ` ${BINDING_MAPPERS[key]}="${encodeQuotes(useValue.replace(/"/g, "\\'"))}" `;
      } else {
        return ` :${key}="${encodeQuotes(useValue)}" `;
      }
    }
  };

export const blockToVue = (node: MitosisNode, options: ToVueOptions): string => {
  const nodeMapper = NODE_MAPPERS[node.name];
  if (nodeMapper) {
    return nodeMapper(node, options);
  }

  if (isChildren(node)) {
    return `<slot></slot>`;
  }

  if (node.name === 'style') {
    // Vue doesn't allow <style>...</style> in templates, but does support the synonymous
    // <component is="'style'">...</component>
    node.name = 'component';
    node.bindings.is = { code: "'style'" };
  }

  if (node.properties._text) {
    return `${node.properties._text}`;
  }

  if (node.bindings._text?.code) {
    return `{{${stripStateAndPropsRefs(node.bindings._text.code as string)}}}`;
  }

  let str = '';

  str += `<${node.name} `;

  if (node.bindings._spread?.code) {
    str += `v-bind="${encodeQuotes(stripStateAndPropsRefs(node.bindings._spread.code as string))}"`;
  }

  for (const key in node.properties) {
    const value = node.properties[key];

    if (key === 'className') {
      continue;
    }

    if (typeof value === 'string') {
      str += ` ${key}="${encodeQuotes(value)}" `;
    }
  }

  const stringifiedBindings = Object.entries(node.bindings)
    .map(([k, v]) =>
      stringifyBinding(node)([k, v] as [
        string,
        { code: string; arguments?: string[] } | undefined,
      ]),
    )
    .join('');

  str += stringifiedBindings;

  if (selfClosingTags.has(node.name)) {
    return str + ' />';
  }

  str += '>';
  if (node.children) {
    str += node.children.map((item) => blockToVue(item, options)).join('');
  }

  return str + `</${node.name}>`;
};

function getContextInjectString(component: MitosisComponent, options: ToVueOptions) {
  let str = '{';

  for (const key in component.context.get) {
    str += `
      ${key}: "${encodeQuotes(component.context.get[key].name)}",
    `;
  }

  str += '}';
  return str;
}

function getContextProvideString(component: MitosisComponent, options: ToVueOptions) {
  let str = '{';

  for (const key in component.context.set) {
    const { value, name } = component.context.set[key];
    str += `
      ${name}: ${
      value
        ? getMemberObjectString(value, {
            valueMapper: (code) => stripStateAndPropsRefs(code, { replaceWith: '_this.' }),
          })
        : null
    },
    `;
  }

  str += '}';
  return str;
}

/**
 * This plugin handle `onUpdate` code that watches depdendencies.
 * We need to apply this workaround to be able to watch specific dependencies in Vue 2: https://stackoverflow.com/a/45853349
 *
 * We add a `computed` property for the dependencies, and a matching `watch` function for the `onUpdate` code
 */
const onUpdatePlugin: Plugin = (options) => ({
  json: {
    post: (component) => {
      if (component.hooks.onUpdate) {
        component.hooks.onUpdate
          .filter((hook) => hook.deps?.length)
          .forEach((hook, index) => {
            component.state[
              getOnUpdateHookName(index)
            ] = `${methodLiteralPrefix}get ${getOnUpdateHookName(index)} () {
            return {
              ${hook.deps
                ?.slice(1, -1)
                .split(',')
                .map((dep, k) => {
                  const val = dep.trim();
                  return `${k}: ${val}`;
                })
                .join(',')}
            }
          }`;
          });
      }
    },
  },
});

const BASE_OPTIONS: ToVueOptions = {
  plugins: [onUpdatePlugin],
  vueVersion: 2,
};

const mergeOptions = (
  { plugins: pluginsA = [], ...a }: ToVueOptions,
  { plugins: pluginsB = [], ...b }: ToVueOptions,
): ToVueOptions => ({
  ...a,
  ...b,
  plugins: [...pluginsA, ...pluginsB],
});

const generateComponentImport =
  (options: ToVueOptions) =>
  (componentName: string): string => {
    const key = kebabCase(componentName);
    if (options.vueVersion === 3 && options.asyncComponentImports) {
      return `'${key}': defineAsyncComponent(${componentName})`;
    } else {
      return `'${key}': ${componentName}`;
    }
  };

const generateComponents = (componentsUsed: string[], options: ToVueOptions): string => {
  if (componentsUsed.length === 0) {
    return '';
  } else {
    return `components: { ${componentsUsed.map(generateComponentImport(options)).join(',')} },`;
  }
};

const componentToVue =
  (userOptions: ToVueOptions): Transpiler =>
  ({ component, path }) => {
    const options = mergeOptions(BASE_OPTIONS, userOptions);
    // Make a copy we can safely mutate, similar to babel's toolchain can be used
    component = fastClone(component);
    processHttpRequests(component);
    processDynamicComponents(component, options);
    processForKeys(component, options);

    if (options.plugins) {
      component = runPreJsonPlugins(component, options.plugins);
    }

    mapRefs(component, (refName) => `this.$refs.${refName}`);

    if (options.plugins) {
      component = runPostJsonPlugins(component, options.plugins);
    }
    const css = collectCss(component, {
      prefix: options.cssNamespace?.() ?? undefined,
    });

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

    const getterString = getStateObjectStringFromComponent(component, {
      data: false,
      getters: true,
      functions: false,
      valueMapper: (code) => processBinding(code.replace(GETTER, ''), options, component),
    });

    let functionsString = getStateObjectStringFromComponent(component, {
      data: false,
      getters: false,
      functions: true,
      valueMapper: (code) => processBinding(code, options, component),
    });

    const blocksString = JSON.stringify(component.children);

    // Component references to include in `component: { YourComponent, ... }
    const componentsUsed = Array.from(getComponentsUsed(component))
      .filter((name) => name.length && !name.includes('.') && name[0].toUpperCase() === name[0])
      // Strip out components that compile away
      .filter((name) => !['For', 'Show', 'Fragment', component.name].includes(name));

    // Append refs to data as { foo, bar, etc }
    dataString = dataString.replace(
      /}$/,
      `${component.imports
        .map((thisImport) => Object.keys(thisImport.imports).join(','))
        // Make sure actually used in template
        .filter((key) => Boolean(key && blocksString.includes(key)))
        // Don't include component imports
        .filter((key) => !componentsUsed.includes(key))
        .join(',')}}`,
    );

    if (localVarAsData.length) {
      dataString = dataString.replace(/}$/, `${localVarAsData.join(',')}}`);
    }

    const elementProps = getProps(component);
    stripMetaProperties(component);

    const template = component.children.map((item) => blockToVue(item, options)).join('\n');

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

    const onUpdateWithDeps = component.hooks.onUpdate?.filter((hook) => hook.deps?.length) || [];
    const onUpdateWithoutDeps =
      component.hooks.onUpdate?.filter((hook) => !hook.deps?.length) || [];

    let str = dedent`
    <template>
      ${template}
    </template>
    <script>
    ${options.vueVersion === 3 ? 'import { defineAsyncComponent } from "vue"' : ''}
      ${renderPreComponent({
        component,
        target: 'vue',
        asyncComponentImports: options.asyncComponentImports,
      })}

      export default {
        ${
          !component.name
            ? ''
            : `name: '${
                path && options.namePrefix?.(path) ? options.namePrefix?.(path) + '-' : ''
              }${kebabCase(component.name)}',`
        }
        ${generateComponents(componentsUsed, options)}
        ${
          elementProps.size
            ? `props: ${JSON.stringify(
                Array.from(elementProps).filter((prop) => prop !== 'children' && prop !== 'class'),
              )},`
            : ''
        }
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
                const _this = this;
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
          component.hooks.onMount?.code
            ? `mounted() {
                ${processBinding(component.hooks.onMount.code, options, component)}
              },`
            : ''
        }
        ${
          onUpdateWithoutDeps.length
            ? `updated() {
            ${onUpdateWithoutDeps
              .map((hook) => processBinding(hook.code, options, component))
              .join('\n')}
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
                  ${processBinding(hook.code, options, component)}
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
                ${processBinding(component.hooks.onUnMount.code, options, component)}
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
      }
    </script>
    ${
      !css.trim().length
        ? ''
        : `<style scoped>
      ${css}
    </style>`
    }
  `;

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (true || options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'vue',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }

    for (const pattern of removePatterns) {
      str = str.replace(pattern, '');
    }

    // Transform <FooBar> to <foo-bar> as Vue2 needs
    return str.replace(/<\/?\w+/g, (match) =>
      match.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    );
  };

type VueOptsWithoutVersion = OmitObj<ToVueOptions, VueVersionOpt>;

export const componentToVue2 = (vueOptions?: VueOptsWithoutVersion) =>
  componentToVue({ ...vueOptions, vueVersion: 2 });

export const componentToVue3 = (vueOptions?: VueOptsWithoutVersion) =>
  componentToVue({ ...vueOptions, vueVersion: 3 });

// Remove unused artifacts like empty script or style tags
const removePatterns = [
  `<script>
export default {};
</script>`,
  `<style>
</style>`,
];
