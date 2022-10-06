import dedent from 'dedent';
import { format } from 'prettier/standalone';
import { collectCss } from '../../helpers/styles/collect-css';
import { fastClone } from '../../helpers/fast-clone';
import { mapRefs } from '../../helpers/map-refs';
import { renderPreComponent } from '../../helpers/render-imports';
import { getProps } from '../../helpers/get-props';
import { MitosisComponent } from '../../types/mitosis-component';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import traverse from 'traverse';
import { pickBy, size, uniq } from 'lodash';
import { processHttpRequests } from '../../helpers/process-http-requests';
import { TranspilerGenerator } from '../../types/transpiler';
import { OmitObj } from '../../helpers/typescript';
import { pipe } from 'fp-ts/lib/function';
import { isSlotProperty } from '../../helpers/slots';
import { FUNCTION_HACK_PLUGIN } from '../helpers/functions';
import { getOnUpdateHookName, renameMitosisComponentsToKebabCase } from './helpers';
import { ToVueOptions, VueVersionOpt } from './types';
import { generateOptionsApiScript } from './optionsApi';
import { generateCompositionApiScript } from './compositionApi';
import { blockToVue } from './blocks';

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
};

const mergeOptions = (
  { plugins: pluginsA = [], ...a }: ToVueOptions,
  { plugins: pluginsB = [], ...b }: ToVueOptions,
): ToVueOptions => ({
  ...a,
  ...b,
  plugins: [...pluginsA, ...pluginsB],
});

const componentToVue: TranspilerGenerator<ToVueOptions> =
  (userOptions = BASE_OPTIONS) =>
  ({ component, path }) => {
    const options = mergeOptions(BASE_OPTIONS, userOptions);
    if (options.api === 'options') {
      options.plugins?.unshift(onUpdatePlugin);
    } else if (options.api === 'composition') {
      options.plugins?.unshift(FUNCTION_HACK_PLUGIN);
      options.asyncComponentImports = false;
    }
    // Make a copy we can safely mutate, similar to babel's toolchain can be used
    component = fastClone(component);
    processHttpRequests(component);
    processDynamicComponents(component, options);
    processForKeys(component, options);

    if (options.plugins) {
      component = runPreJsonPlugins(component, options.plugins);
    }

    if (options.api === 'options') {
      mapRefs(component, (refName) => `this.$refs.${refName}`);
    }

    if (options.plugins) {
      component = runPostJsonPlugins(component, options.plugins);
    }
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

    const elementProps = Array.from(getProps(component)).filter((prop) => !isSlotProperty(prop));

    // import from vue
    let vueImports: string[] = [];
    if (options.vueVersion >= 3 && options.asyncComponentImports) {
      vueImports.push('defineAsyncComponent');
    }
    if (options.api === 'composition') {
      onUpdateWithDeps.length && vueImports.push('watch');
      component.hooks.onMount?.code && vueImports.push('onMounted');
      component.hooks.onUnMount?.code && vueImports.push('onUnMounted');
      onUpdateWithoutDeps.length && vueImports.push('onUpdated');
      size(getterKeys) && vueImports.push('computed');
      size(component.context.set) && vueImports.push('provide');
      size(component.context.get) && vueImports.push('inject');
      size(
        Object.keys(component.state).filter((key) => component.state[key]?.type === 'property'),
      ) && vueImports.push('ref');
    }

    const tsLangAttribute = options.typescript ? `lang='ts'` : '';

    let str: string = dedent`
    <template>
      ${template}
    </template>


    <script ${options.api === 'composition' ? 'setup' : ''} ${tsLangAttribute}>
      ${vueImports.length ? `import { ${uniq(vueImports).sort().join(', ')} } from "vue"` : ''}
      ${(options.typescript && component.types?.join('\n')) || ''}

      ${renderPreComponent({
        component,
        target: 'vue',
        asyncComponentImports: options.asyncComponentImports,
      })}

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

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
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

// Remove unused artifacts like empty script or style tags
const removePatterns = [
  `<script>
export default {};
</script>`,
  `<style>
</style>`,
];
