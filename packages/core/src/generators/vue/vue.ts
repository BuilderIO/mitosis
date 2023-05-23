import { flow, pipe } from 'fp-ts/lib/function';
import { pickBy, size, uniq } from 'lodash';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { convertTypeScriptToJS } from '../../helpers/babel-transform';
import { createSingleBinding } from '../../helpers/bindings';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { getProps } from '../../helpers/get-props';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { mapRefs } from '../../helpers/map-refs';
import { mergeOptions } from '../../helpers/merge-options';
import { CODE_PROCESSOR_PLUGIN } from '../../helpers/plugins/process-code';
import { processHttpRequests } from '../../helpers/process-http-requests';
import { renderPreComponent } from '../../helpers/render-imports';
import { replaceStateIdentifier } from '../../helpers/replace-identifiers';
import { isSlotProperty } from '../../helpers/slots';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { collectCss } from '../../helpers/styles/collect-css';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { TranspilerGenerator } from '../../types/transpiler';
import { FUNCTION_HACK_PLUGIN } from '../helpers/functions';
import { blockToVue } from './blocks';
import { generateCompositionApiScript } from './compositionApi';
import { getOnUpdateHookName, processBinding, renameMitosisComponentsToKebabCase } from './helpers';
import { generateOptionsApiScript } from './optionsApi';
import { ToVueOptions, VueOptsWithoutVersion } from './types';

// Transform <foo.bar key="value" /> to <component :is="foo.bar" key="value" />
function processDynamicComponents(json: MitosisComponent, _options: ToVueOptions) {
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.name.includes('.')) {
        node.bindings.is = createSingleBinding({ code: node.name });
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

/**
 * This plugin handle `onUpdate` code that watches dependencies.
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
  plugins: [],
  vueVersion: 2,
  api: 'options',
  defineComponent: true,
};

const componentToVue: TranspilerGenerator<Partial<ToVueOptions>> =
  (userOptions) =>
  ({ component, path }) => {
    const options = mergeOptions(BASE_OPTIONS, userOptions);
    options.plugins.unshift(
      CODE_PROCESSOR_PLUGIN((codeType) => {
        if (options.api === 'composition') {
          switch (codeType) {
            case 'hooks':
              return (code) => processBinding({ code, options, json: component });
            case 'state':
              return (code) => processBinding({ code, options, json: component });
            case 'bindings':
              return flow(
                // Strip types from any JS code that ends up in the template, because Vue does not support TS code in templates.
                convertTypeScriptToJS,
                (code) => processBinding({ code, options, json: component, codeType }),
              );
            case 'hooks-deps':
              return replaceStateIdentifier(null);
            case 'properties':
            case 'dynamic-jsx-elements':
              return (c) => c;
          }
        } else {
          switch (codeType) {
            case 'hooks':
              return (code) => processBinding({ code, options, json: component });
            case 'bindings':
              return flow(
                // Strip types from any JS code that ends up in the template, because Vue does not support TS code in templates.
                convertTypeScriptToJS,
                (code) => processBinding({ code, options, json: component, codeType }),
              );
            case 'properties':
            case 'dynamic-jsx-elements':
            case 'hooks-deps':
              return (c) => c;
            case 'state':
              return (c) => processBinding({ code: c, options, json: component });
          }
        }
      }),
    );

    if (options.api === 'options') {
      options.plugins.unshift(onUpdatePlugin);
    } else if (options.api === 'composition') {
      options.plugins.unshift(FUNCTION_HACK_PLUGIN);
      options.asyncComponentImports = false;
    }
    // Make a copy we can safely mutate, similar to babel's toolchain can be used
    component = fastClone(component);
    processHttpRequests(component);
    processDynamicComponents(component, options);
    processForKeys(component, options);

    component = runPreJsonPlugins(component, options.plugins);

    if (options.api === 'options') {
      mapRefs(component, (refName) => `this.$refs.${refName}`);
    }

    // need to run this before we process the component's code
    const props = Array.from(getProps(component));
    const elementProps = props.filter((prop) => !isSlotProperty(prop));
    const slotsProps = props.filter((prop) => isSlotProperty(prop));

    component = runPostJsonPlugins(component, options.plugins);

    const css = collectCss(component, {
      prefix: options.cssNamespace?.() ?? undefined,
    });

    stripMetaProperties(component);

    const template = pipe(
      component.children.map((item) => blockToVue(item, options, { isRootNode: true })).join('\n'),
      renameMitosisComponentsToKebabCase,
    );

    const onUpdateWithDeps = component.hooks.onUpdate?.filter((hook) => hook.deps?.length) || [];
    const onUpdateWithoutDeps =
      component.hooks.onUpdate?.filter((hook) => !hook.deps?.length) || [];

    const getterKeys = Object.keys(pickBy(component.state, (i) => i?.type === 'getter'));

    // import from vue
    let vueImports: string[] = [];
    if (options.vueVersion >= 3 && options.asyncComponentImports) {
      vueImports.push('defineAsyncComponent');
    }
    if (options.api === 'options' && options.defineComponent) {
      vueImports.push('defineComponent');
    }
    if (options.api === 'composition') {
      onUpdateWithDeps.length && vueImports.push('watch');
      component.hooks.onMount?.code && vueImports.push('onMounted');
      component.hooks.onUnMount?.code && vueImports.push('onUnmounted');
      onUpdateWithoutDeps.length && vueImports.push('onUpdated');
      size(getterKeys) && vueImports.push('computed');
      size(component.context.set) && vueImports.push('provide');
      size(component.context.get) && vueImports.push('inject');
      size(
        Object.keys(component.state).filter((key) => component.state[key]?.type === 'property'),
      ) && vueImports.push('ref');
      size(slotsProps) && vueImports.push('useSlots');
    }

    const tsLangAttribute = options.typescript ? `lang='ts'` : '';

    let str: string = dedent`
    ${
      template.trim().length > 0
        ? `<template>
      ${template}
    </template>`
        : ''
    }


    <script ${options.api === 'composition' ? 'setup' : ''} ${tsLangAttribute}>
      ${vueImports.length ? `import { ${uniq(vueImports).sort().join(', ')} } from "vue"` : ''}

      ${renderPreComponent({
        component,
        target: 'vue',
        asyncComponentImports: options.asyncComponentImports,
      })}

      ${(options.typescript && component.types?.join('\n')) || ''}

      ${
        options.api === 'composition'
          ? generateCompositionApiScript(
              component,
              options,
              template,
              elementProps,
              onUpdateWithDeps,
              onUpdateWithoutDeps,
            )
          : generateOptionsApiScript(
              component,
              options,
              path,
              template,
              elementProps,
              onUpdateWithDeps,
              onUpdateWithoutDeps,
            )
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

    str = runPreCodePlugins(str, options.plugins, { json: component });
    if (true || options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'vue',
          plugins: [
            // To support running in browsers
            require('prettier/parser-typescript'),
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    str = runPostCodePlugins(str, options.plugins);

    for (const pattern of removePatterns) {
      str = str.replace(pattern, '').trim();
    }
    str = str.replace(/<script(.*)>\n?<\/script>/g, '').trim();

    return str;
  };

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
