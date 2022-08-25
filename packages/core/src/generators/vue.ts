import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/styles/collect-css';
import { fastClone } from '../helpers/fast-clone';
import {
  stringifyContextValue,
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
import { BaseTranspilerOptions, Transpiler } from '../types/transpiler';
import { GETTER } from '../helpers/patterns';
import { OmitObj } from '../helpers/typescript';
import { pipe } from 'fp-ts/lib/function';
import { getCustomImports } from '../helpers/get-custom-imports';
import { isSlotProperty, stripSlotPrefix, propSlotsToTemplateSlots } from '../helpers/slots';
import { PropsDefinition, DefaultProps } from 'vue/types/options';

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

const SPECIAL_PROPERTIES = {
  V_IF: 'v-if',
  V_FOR: 'v-for',
  V_ELSE: 'v-else',
  V_ELSE_IF: 'v-else-if',
} as const;

function getContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get);
}

const ON_UPDATE_HOOK_NAME = 'onUpdateHook';

const getOnUpdateHookName = (index: number) => ON_UPDATE_HOOK_NAME + `${index}`;

const invertBooleanExpression = (expression: string) => `!Boolean(${expression})`;

const addPropertiesToJson =
  (properties: MitosisNode['properties']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    properties: {
      ...json.properties,
      ...properties,
    },
  });

const addBindingsToJson =
  (bindings: MitosisNode['bindings']) =>
  (json: MitosisNode): MitosisNode => ({
    ...json,
    bindings: {
      ...json.bindings,
      ...bindings,
    },
  });

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

type BlockRenderer = (json: MitosisNode, options: ToVueOptions, scope?: Scope) => string;

const NODE_MAPPERS: {
  [key: string]: BlockRenderer | undefined;
} = {
  Fragment(json, options) {
    return json.children.map((item) => blockToVue(item, options)).join('\n');
  },
  For(json, options) {
    const keyValue = json.bindings.key || { code: 'index' };
    const forValue = `(${json.properties._forName}, index) in ${stripStateAndPropsRefs(
      json.bindings.each?.code,
    )}`;

    if (options.vueVersion >= 3) {
      // TODO: tmk key goes on different element (parent vs child) based on Vue 2 vs Vue 3
      return `<template :key="${encodeQuotes(keyValue?.code || 'index')}" v-for="${encodeQuotes(
        forValue,
      )}">
        ${json.children.map((item) => blockToVue(item, options)).join('\n')}
      </template>`;
    }
    // Vue 2 can only handle one root element
    const firstChild = json.children.filter(filterEmptyTextNodes)[0] as MitosisNode | undefined;

    // Edge-case for when the parent is a `Show`, we need to pass down the `v-if` prop.
    const jsonIf = json.properties[SPECIAL_PROPERTIES.V_IF];

    return firstChild
      ? pipe(
          firstChild,
          addBindingsToJson({ key: keyValue }),
          addPropertiesToJson({
            [SPECIAL_PROPERTIES.V_FOR]: forValue,
            ...(jsonIf ? { [SPECIAL_PROPERTIES.V_IF]: jsonIf } : {}),
          }),
          (block) => blockToVue(block, options),
        )
      : '';
  },
  Show(json, options, scope) {
    const ifValue = propSlotsToTemplateSlots(stripStateAndPropsRefs(json.bindings.when?.code));

    switch (options.vueVersion) {
      case 3:
        return `
        <template ${SPECIAL_PROPERTIES.V_IF}="${encodeQuotes(ifValue)}">
          ${json.children.map((item) => blockToVue(item, options)).join('\n')}
        </template>
        ${
          isMitosisNode(json.meta.else)
            ? `
            <template ${SPECIAL_PROPERTIES.V_ELSE}>
              ${blockToVue(json.meta.else, options)}
            </template>`
            : ''
        }
        `;
      case 2:
        // Vue 2 can only handle one root element, so we just take the first one.
        // TO-DO: warn user of multi-children Show.
        const firstChild = json.children.filter(filterEmptyTextNodes)[0] as MitosisNode | undefined;
        const elseBlock = json.meta.else;

        const hasShowChild = firstChild?.name === 'Show';
        const childElseBlock = firstChild?.meta.else;

        /**
         * This is special edge logic to handle 2 nested Show elements in Vue 2.
         * We need to invert the logic to make it work, due to no-template-root-element limitations in Vue 2.
         *
         * <show when={foo} else={else-1}>
         *  <show when={bar} else={else-2}>
         *   <if-code>
         *  </show>
         * </show>
         *
         *
         * foo: true && bar: true => if-code
         * foo: true && bar: false => else-2
         * foo: false && bar: true?? => else-1
         *
         *
         * map to:
         *
         * <else-1 if={!foo} />
         * <else-2 else-if={!bar} />
         * <if-code v-else />
         *
         */
        if (
          firstChild &&
          isMitosisNode(elseBlock) &&
          hasShowChild &&
          isMitosisNode(childElseBlock)
        ) {
          const ifString = pipe(
            elseBlock,
            addPropertiesToJson({ [SPECIAL_PROPERTIES.V_IF]: invertBooleanExpression(ifValue) }),
            (block) => blockToVue(block, options),
          );

          const childIfValue = pipe(
            firstChild.bindings.when?.code,
            stripStateAndPropsRefs,
            invertBooleanExpression,
          );
          const elseIfString = pipe(
            childElseBlock,
            addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE_IF]: childIfValue }),
            (block) => blockToVue(block, options),
          );

          const firstChildOfFirstChild = firstChild.children.filter(filterEmptyTextNodes)[0] as
            | MitosisNode
            | undefined;
          const elseString = firstChildOfFirstChild
            ? pipe(
                firstChildOfFirstChild,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE]: '' }),
                (block) => blockToVue(block, options),
              )
            : '';

          return `

            ${ifString}

            ${elseIfString}

            ${elseString}

          `;
        } else {
          const ifString = firstChild
            ? pipe(
                firstChild,
                addPropertiesToJson({ [SPECIAL_PROPERTIES.V_IF]: ifValue }),
                (block) => blockToVue(block, options),
              )
            : '';

          const elseString = isMitosisNode(elseBlock)
            ? pipe(elseBlock, addPropertiesToJson({ [SPECIAL_PROPERTIES.V_ELSE]: '' }), (block) =>
                blockToVue(block, options),
              )
            : '';

          return `
                    ${ifString}
                    ${elseString}
                  `;
        }
    }
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
        replaceWith: '',
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
            removeSurroundingBlock(replaceIdentifiers(useValue, cusArgs[0], '$event')),
          )}" `;
        } else {
          return ` @${event}="${encodeQuotes(
            removeSurroundingBlock(
              removeSurroundingBlock(replaceIdentifiers(useValue, cusArgs[0], '$event')),
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

interface Scope {
  isRootNode?: boolean;
}

export const blockToVue: BlockRenderer = (node, options, scope) => {
  const nodeMapper = NODE_MAPPERS[node.name];
  if (nodeMapper) {
    return nodeMapper(node, options, scope);
  }

  if (isChildren(node)) {
    return `<slot/>`;
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

  const textCode = node.bindings._text?.code;
  if (textCode) {
    const strippedTextCode = stripStateAndPropsRefs(textCode);
    if (isSlotProperty(strippedTextCode)) {
      return `<slot name="${stripSlotPrefix(strippedTextCode).toLowerCase()}"/>`;
    }
    return `{{${strippedTextCode}}}`;
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
    } else if (key === SPECIAL_PROPERTIES.V_ELSE) {
      str += ` ${key} `;
    } else if (typeof value === 'string') {
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
        ? stringifyContextValue(value, {
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
            const code = `get ${getOnUpdateHookName(index)} () {
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

            component.state[getOnUpdateHookName(index)] = {
              code,
              type: 'getter',
            };
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
    if (options.vueVersion >= 3 && options.asyncComponentImports) {
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

const appendToDataString = ({
  dataString,
  newContent,
}: {
  dataString: string;
  newContent: string;
}) => dataString.replace(/}$/, `${newContent}}`);

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

    // Component references to include in `component: { YourComponent, ... }
    const componentsUsed = Array.from(getComponentsUsed(component))
      .filter((name) => name.length && !name.includes('.') && name[0].toUpperCase() === name[0])
      // Strip out components that compile away
      .filter((name) => !['For', 'Show', 'Fragment', component.name].includes(name));

    // Append refs to data as { foo, bar, etc }
    dataString = appendToDataString({
      dataString,
      newContent: getCustomImports(component).join(','),
    });

    if (localVarAsData.length) {
      dataString = appendToDataString({ dataString, newContent: localVarAsData.join(',') });
    }

    const elementProps = getProps(component);
    stripMetaProperties(component);

    const template = pipe(
      component.children.map((item) => blockToVue(item, options, { isRootNode: true })).join('\n'),
      renameMitosisComponentsToKebabCase,
    );

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

    let propsDefinition: PropsDefinition<DefaultProps> = Array.from(elementProps).filter(
      (prop) => prop !== 'children' && prop !== 'class',
    );

    if (component.defaultProps) {
      propsDefinition = propsDefinition.reduce(
        (propsDefinition: DefaultProps, curr: string) => (
          (propsDefinition[curr] =
            component.defaultProps && component.defaultProps.hasOwnProperty(curr)
              ? { default: component.defaultProps[curr] }
              : {}),
          propsDefinition
        ),
        {},
      );
    }

    let str = dedent`
    <template>
      ${template}
    </template>
    <script lang="ts">
    ${options.vueVersion >= 3 ? 'import { defineAsyncComponent } from "vue"' : ''}
      ${renderPreComponent({
        component,
        target: 'vue',
        asyncComponentImports: options.asyncComponentImports,
      })}

      ${component.types?.join('\n') || ''}

      export default {
        ${
          !component.name
            ? ''
            : `name: '${
                path && options.namePrefix?.(path) ? options.namePrefix?.(path) + '-' : ''
              }${kebabCase(component.name)}',`
        }
        ${generateComponents(componentsUsed, options)}
        ${elementProps.size ? `props: ${JSON.stringify(propsDefinition)},` : ''}
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

    return str;
  };

type VueOptsWithoutVersion = OmitObj<ToVueOptions, VueVersionOpt>;

export const componentToVue2 = (vueOptions?: VueOptsWithoutVersion) =>
  componentToVue({ ...vueOptions, vueVersion: 2 });

export const componentToVue3 = (vueOptions?: VueOptsWithoutVersion) =>
  componentToVue({ ...vueOptions, vueVersion: 3 });

// Transform <FooBar> to <foo-bar> as Vue2 needs
const renameMitosisComponentsToKebabCase = (str: string) =>
  str.replace(/<\/?\w+/g, (match) => match.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());

// Remove unused artifacts like empty script or style tags
const removePatterns = [
  `<script>
export default {};
</script>`,
  `<style>
</style>`,
];
