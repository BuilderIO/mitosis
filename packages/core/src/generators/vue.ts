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
import { size } from 'lodash';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';

export type ToVueOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
  vueVersion?: 2 | 3;
  cssNamespace?: string;
};

function getContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get);
}

// TODO: migrate all stripStateAndPropsRefs to use this here
// to properly replace context refs
function processBinding(
  code: string,
  _options: ToVueOptions,
  json: MitosisComponent,
): string {
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
  [key: string]:
    | ((json: MitosisNode, options: ToVueOptions) => string)
    | undefined;
} = {
  Fragment(json, options) {
    return json.children.map((item) => blockToVue(item, options)).join('\n');
  },
  For(json, options) {
    return `<template :key="${json.bindings.key || 'index'}" v-for="(${
      json.properties._forName
    }, index) in ${stripStateAndPropsRefs(json.bindings.each as string)}">
      ${json.children.map((item) => blockToVue(item, options)).join('\n')}
    </template>`;
  },
  Show(json, options) {
    return `<template v-if="${stripStateAndPropsRefs(
      json.bindings.when as string,
    )}">
      ${json.children.map((item) => blockToVue(item, options)).join('\n')}
    </template>`;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: { [key: string]: string | undefined } = {
  innerHTML: 'v-html',
};

// Transform <foo.bar key="value" /> to <component :is="foo.bar" key="value" />
function processDynamicComponents(
  json: MitosisComponent,
  options: ToVueOptions,
) {
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name.includes('.')) {
        node.bindings.is = node.name;
        node.name = 'component';
      }
    }
  });
}

function processForKeys(json: MitosisComponent, options: ToVueOptions) {
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

export const blockToVue = (
  node: MitosisNode,
  options: ToVueOptions,
): string => {
  const nodeMapper = NODE_MAPPERS[node.name];
  if (nodeMapper) {
    return nodeMapper(node, options);
  }

  if (isChildren(node)) {
    return `<slot></slot>`;
  }

  if (node.name === 'style') {
    // Vue doesn't allow <style>...</style> in templates, but does support the synonymous
    // <component is="style">...</component>
    node.name = 'component';
    node.properties.is = 'style';
  }

  if (node.properties._text) {
    return `${node.properties._text}`;
  }

  if (node.bindings._text) {
    return `{{${stripStateAndPropsRefs(node.bindings._text as string)}}}`;
  }

  let str = '';

  str += `<${node.name} `;

  if (node.bindings._spread) {
    str += `v-bind="${stripStateAndPropsRefs(
      node.bindings._spread as string,
    )}"`;
  }

  for (const key in node.properties) {
    const value = node.properties[key];
    str += ` ${key}="${value}" `;
  }

  for (const key in node.bindings) {
    if (key === '_spread') {
      continue;
    }
    const value = node.bindings[key] as string;
    if (key === 'class') {
      str += ` :class="_classStringToObject(${stripStateAndPropsRefs(value, {
        replaceWith: 'this.',
      })})" `;
      // TODO: support dynamic classes as objects somehow like Vue requires
      // https://vuejs.org/v2/guide/class-and-style.html
      continue;
    }
    // TODO: proper babel transform to replace. Util for this
    const useValue = stripStateAndPropsRefs(value);

    if (key.startsWith('on')) {
      let event = key.replace('on', '').toLowerCase();
      if (event === 'change' && node.name === 'input') {
        event = 'input';
      }
      // TODO: proper babel transform to replace. Util for this
      str += ` @${event}="${removeSurroundingBlock(
        useValue
          // TODO: proper reference parse and replacing
          .replace(/event\./g, '$event.'),
      )}" `;
    } else if (key === 'ref') {
      str += ` ref="${useValue}" `;
    } else if (BINDING_MAPPERS[key]) {
      str += ` ${BINDING_MAPPERS[key]}="${useValue}" `;
    } else {
      str += ` :${key}="${useValue}" `;
    }
  }

  if (selfClosingTags.has(node.name)) {
    return str + ' />';
  }

  str += '>';
  if (node.children) {
    str += node.children.map((item) => blockToVue(item, options)).join('');
  }

  return str + `</${node.name}>`;
};

function getContextInjectString(
  component: MitosisComponent,
  options: ToVueOptions,
) {
  let str = '{';

  for (const key in component.context.get) {
    str += `
      ${key}: "${component.context.get[key].name}",
    `;
  }

  str += '}';
  return str;
}

function getContextProvideString(
  component: MitosisComponent,
  options: ToVueOptions,
) {
  let str = '{';

  for (const key in component.context.set) {
    const { value, name } = component.context.set[key];
    str += `
      ${name}: ${
      value
        ? getMemberObjectString(value, {
            valueMapper: (code) =>
              stripStateAndPropsRefs(code, { replaceWith: '_this.' }),
          })
        : null
    },
    `;
  }

  str += '}';
  return str;
}

export const componentToVue = (
  component: MitosisComponent,
  options: ToVueOptions = {},
) => {
  // Make a copy we can safely mutate, similar to babel's toolchain can be used
  component = fastClone(component);
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
    prefix: options.cssNamespace,
  });

  let dataString = getStateObjectStringFromComponent(component, {
    data: true,
    functions: false,
    getters: false,
  });

  const getterString = getStateObjectStringFromComponent(component, {
    data: false,
    getters: true,
    functions: false,
    valueMapper: (code) =>
      processBinding(code.replace(/^get /, ''), options, component),
  });

  let functionsString = getStateObjectStringFromComponent(component, {
    data: false,
    getters: false,
    functions: true,
    valueMapper: (code) => processBinding(code, options, component),
  });

  const blocksString = JSON.stringify(component.children);

  // Append refs to data as { foo, bar, etc }
  dataString = dataString.replace(
    /}$/,
    `${component.imports
      .map((thisImport) => Object.keys(thisImport.imports).join(','))
      .filter((key) => Boolean(key && blocksString.includes(key)))
      .join(',')}}`,
  );

  // Component references to include in `component: { YourComponent, ... }
  const componentsUsed = Array.from(getComponentsUsed(component))
    .filter(
      (name) =>
        name.length && !name.includes('.') && name[0].toUpperCase() === name[0],
    )
    // Strip out components that compile away
    .filter(
      (name) => !['For', 'Show', 'Fragment', component.name].includes(name),
    );

  const elementProps = getProps(component);
  stripMetaProperties(component);

  const template = component.children
    .map((item) => blockToVue(item, options))
    .join('\n');

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

  let str = dedent`
    <template>
      ${template}
    </template>
    <script>
      ${renderPreComponent(component)}

      export default {
        ${!component.name ? '' : `name: '${component.name}',`}
        ${
          !componentsUsed.length
            ? ''
            : `components: { ${componentsUsed.join(',')} },`
        }
        ${
          elementProps.size
            ? `props: ${JSON.stringify(
                Array.from(elementProps).filter((prop) => prop !== 'children'),
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
          component.hooks.onMount
            ? `mounted() {
                ${processBinding(component.hooks.onMount, options, component)}
              },`
            : ''
        }
        ${
          component.hooks.onUnMount
            ? `unmounted() {
                ${processBinding(component.hooks.onUnMount, options, component)}
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

// Remove unused artifacts like empty script or style tags
const removePatterns = [
  `<script>
export default {};
</script>`,
  `<style>
</style>`,
];
