import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getStateObjectStringFromComponent } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { getProps } from '../helpers/get-props';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
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
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import traverse from 'traverse';
import { getComponentsUsed } from '../helpers/get-components-used';

export type ToVueOptions = {
  prettier?: boolean;
  plugins?: Plugin[];
};

function processBinding(code: string, _options: ToVueOptions): string {
  return stripStateAndPropsRefs(code, {
    includeState: true,
    includeProps: true,

    replaceWith: 'this.',
  });
}

const NODE_MAPPERS: {
  [key: string]:
    | ((json: JSXLiteNode, options: ToVueOptions) => string)
    | undefined;
} = {
  Fragment(json, options) {
    return json.children.map((item) => blockToVue(item, options)).join('\n');
  },
  For(json, options) {
    return `<template v-for="${
      json.bindings._forName
    } in ${stripStateAndPropsRefs(json.bindings.each as string)}">
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
  json: JSXLiteComponent,
  options: ToVueOptions,
) {
  traverse(json).forEach((node) => {
    if (isJsxLiteNode(node)) {
      if (node.name.includes('.')) {
        node.bindings.is = node.name;
        node.name = 'component';
      }
    }
  });
}

export const blockToVue = (
  node: JSXLiteNode,
  options: ToVueOptions,
): string => {
  const nodeMapper = NODE_MAPPERS[node.name];
  if (nodeMapper) {
    return nodeMapper(node, options);
  }

  if (isChildren(node)) {
    return `<slot></slot>`;
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
    if (key === 'class') {
      // TODO: support dynamic classes as objects somehow like Vue requires
      // https://vuejs.org/v2/guide/class-and-style.html
      continue;
    }
    const value = node.bindings[key] as string;
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

export const componentToVue = (
  component: JSXLiteComponent,
  options: ToVueOptions = {},
) => {
  // Make a copy we can safely mutate, similar to babel's toolchain can be used
  component = fastClone(component);
  processDynamicComponents(component, options);

  if (options.plugins) {
    component = runPreJsonPlugins(component, options.plugins);
  }

  mapRefs(component, (refName) => `this.$refs.${refName}`);

  if (options.plugins) {
    component = runPostJsonPlugins(component, options.plugins);
  }
  const css = collectCss(component);

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
      stripStateAndPropsRefs(code.replace(/^get /, ''), {
        replaceWith: 'this.',
      }),
  });

  const functionsString = getStateObjectStringFromComponent(component, {
    data: false,
    getters: false,
    functions: true,
    valueMapper: (code) =>
      stripStateAndPropsRefs(code, { replaceWith: 'this.' }),
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

  let str = dedent`
    <template>
      ${component.children.map((item) => blockToVue(item, options)).join('\n')}
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
          component.hooks.onMount
            ? `mounted() {
                ${processBinding(component.hooks.onMount, options)}
              },`
            : ''
        }
        ${
          component.hooks.onUnMount
            ? `unmounted() {
                ${processBinding(component.hooks.onUnMount, options)}
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
        : `<style>
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
