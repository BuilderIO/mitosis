import { babelTransformCode, convertTypeScriptToJS } from '@/helpers/babel-transform';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { getProps } from '@/helpers/get-props';
import { getRefs } from '@/helpers/get-refs';
import {
  getStateObjectStringFromComponent,
  stringifyContextValue,
} from '@/helpers/get-state-object-string';
import { gettersToFunctions } from '@/helpers/getters-to-functions';
import { isMitosisNode } from '@/helpers/is-mitosis-node';
import { initializeOptions } from '@/helpers/merge-options';
import { processOnEventHooksPlugin } from '@/helpers/on-event';
import { stripGetter } from '@/helpers/patterns';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { renderPreComponent } from '@/helpers/render-imports';
import { isSlotProperty } from '@/helpers/slots';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { collectCss } from '@/helpers/styles/collect-css';
import { hasStyle } from '@/helpers/styles/helpers';
import { MitosisComponent } from '@/types/mitosis-component';
import { TranspilerGenerator } from '@/types/transpiler';
import { flow, pipe } from 'fp-ts/lib/function';
import traverse from 'neotraverse/legacy';
import * as prettierPluginSvelte from 'prettier-plugin-svelte';
import prettierParserBabel from 'prettier/parser-babel';
import prettierParserHtml from 'prettier/parser-html';
import prettierParserPostcss from 'prettier/parser-postcss';
import prettierParserTypescript from 'prettier/parser-typescript';
import { format } from 'prettier/standalone';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { getContextType, hasGetContext, hasSetContext } from '../helpers/context';
import { FUNCTION_HACK_PLUGIN } from '../helpers/functions';
import { blockToSvelte } from './blocks';
import { stripStateAndProps } from './helpers';
import { ToSvelteOptions } from './types';

const getContextCode = (json: MitosisComponent) => {
  const contextGetters = json.context.get;
  return Object.entries(contextGetters)
    .map(([key, context]): string => {
      const { name } = context;

      const contextType = getContextType({ component: json, context });

      switch (contextType) {
        case 'reactive':
        case 'normal':
          return `let ${key} = getContext(${name}.key);`;
      }
    })
    .join('\n');
};

const setContextCode = ({
  json,
  options,
}: {
  json: MitosisComponent;
  options: ToSvelteOptions;
}) => {
  const processCode = stripStateAndProps({ json, options });

  return Object.values(json.context.set)
    .map((context) => {
      const { value, name, ref } = context;
      const nameIsStringLiteral =
        (name.startsWith("'") && name.endsWith("'")) ||
        (name.startsWith('"') && name.endsWith('"'));

      const key = nameIsStringLiteral ? name : `${name}.key`;

      const valueStr = value
        ? processCode(stringifyContextValue(value))
        : ref
        ? processCode(ref)
        : 'undefined';

      const contextType = getContextType({ component: json, context });

      switch (contextType) {
        case 'normal':
          return `setContext(${key}, ${valueStr});`;
        case 'reactive':
          const storeName = `${name}ContextStoreValue`;

          return `
            const ${storeName} = writable(${valueStr});
            setContext(${key}, ${storeName});
          `;
      }
    })
    .join('\n');
};

/**
 * Replace
 *    <input value={state.name} onChange={event => state.name = event.target.value}
 * with
 *    <input bind:value={state.name}/>
 * when easily identified, for more idiomatic svelte code
 */
const useBindValue = (json: MitosisComponent, options: ToSvelteOptions) => {
  function normalizeStr(str: string) {
    return str
      .trim()
      .replace(/\n|\r/g, '')
      .replace(/^{/, '')
      .replace(/}$/, '')
      .replace(/;$/, '')
      .replace(/\s+/g, '');
  }
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const { value, onChange } = item.bindings;
      if (value && onChange) {
        const { arguments: cusArgs = ['event'] } = onChange;
        if (
          normalizeStr(onChange.code) === `${normalizeStr(value.code)}=${cusArgs[0]}.target.value`
        ) {
          delete item.bindings.value;
          delete item.bindings.onChange;
          item.bindings['bind:value'] = value;
        }
      }
    }
  });
};

const DEFAULT_OPTIONS: ToSvelteOptions = {
  stateType: 'variables',
  prettier: true,
};

export const componentToSvelte: TranspilerGenerator<ToSvelteOptions> =
  (userProvidedOptions) =>
  ({ component }) => {
    const options = initializeOptions({
      target: 'svelte',
      component,
      defaults: DEFAULT_OPTIONS,
      userOptions: userProvidedOptions,
    });

    options.plugins = [
      ...(options.plugins || []),
      processOnEventHooksPlugin(),
      FUNCTION_HACK_PLUGIN,
      // Strip types from any JS code that ends up in the template, because Svelte does not support TS code in templates.
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'bindings':
          case 'properties':
            return convertTypeScriptToJS;
          case 'hooks':
          case 'hooks-deps':
          case 'state':
          case 'context-set':
          case 'dynamic-jsx-elements':
          case 'types':
            return (x) => x;
        }
      }),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'hooks':
            return flow(stripStateAndProps({ json, options }), babelTransformCode);
          case 'bindings':
          case 'hooks-deps':
          case 'state':
            return flow(stripStateAndProps({ json, options }), stripGetter);
          case 'properties':
          case 'context-set':
            return flow(stripStateAndProps({ json, options }));
          case 'dynamic-jsx-elements':
          case 'types':
            return (x) => x;
        }
      }),
    ];

    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    json = runPreJsonPlugins({ json, plugins: options.plugins });

    useBindValue(json, options);

    gettersToFunctions(json);

    const filteredProps = Array.from(getProps(json))
      .filter((prop) => !isSlotProperty(prop))
      // map $prop to prop for reactive state
      .map((x) => (x.startsWith('$') ? x.slice(1) : x));

    // this helps make sure we don't have duplicate props
    const props = Array.from(new Set(filteredProps));

    const refs = Array.from(getRefs(json))
      .map(stripStateAndProps({ json, options }))
      .filter((x) => !props.includes(x));

    json = runPostJsonPlugins({ json, plugins: options.plugins });

    const css = collectCss(json);
    stripMetaProperties(json);

    let usesWritable = false;

    const dataString = pipe(
      getStateObjectStringFromComponent(json, {
        data: true,
        functions: false,
        getters: false,
        format: options.stateType === 'proxies' ? 'object' : 'variables',
        keyPrefix: options.stateType === 'variables' ? 'let ' : '',
        valueMapper: (code, _t, _p, key) => {
          if (json.state[key!]?.propertyType === 'reactive') {
            usesWritable = true;
            return `writable(${code})`;
          }
          return code;
        },
      }),
      babelTransformCode,
    );

    const getterString = pipe(
      getStateObjectStringFromComponent(json, {
        data: false,
        getters: true,
        functions: false,
        format: 'variables',
        keyPrefix: '$: ',
        valueMapper: (code) => {
          return code
            .trim()
            .replace(/^([a-zA-Z_\$0-9]+)/, '$1 = ')
            .replace(/\)/, ') => ');
        },
      }),
      babelTransformCode,
    );

    const functionsString = pipe(
      getStateObjectStringFromComponent(json, {
        data: false,
        getters: false,
        functions: true,
        format: 'variables',
      }),
      babelTransformCode,
    );

    const hasData = dataString.length > 4;

    let str = '';

    const tsLangAttribute = options.typescript ? `lang='ts'` : '';

    if (options.typescript && json.types?.length) {
      str += dedent`
      <script context='module' ${tsLangAttribute}>
        ${json.types ? json.types.join('\n\n') + '\n' : ''}
      </script>
      \n
      \n
      `;
    }

    // prepare svelte imports
    let svelteImports: string[] = [];
    let svelteStoreImports: string[] = [];

    if (json.hooks.onMount.length) {
      svelteImports.push('onMount');
    }
    if (json.hooks.onUpdate?.filter((x) => !x.deps)?.length) {
      svelteImports.push('afterUpdate');
    }
    if (json.hooks.onUnMount?.code?.length) {
      svelteImports.push('onDestroy');
    }
    if (hasGetContext(component)) {
      svelteImports.push('getContext');
    }
    if (hasSetContext(component)) {
      svelteImports.push('setContext');
    }

    if (usesWritable) {
      svelteStoreImports.push('writable');
    }

    str += dedent`
      <script ${tsLangAttribute}>
      ${!svelteImports.length ? '' : `import { ${svelteImports.sort().join(', ')} } from 'svelte'`}
      ${
        !svelteStoreImports.length
          ? ''
          : `import { ${svelteStoreImports.sort().join(', ')} } from 'svelte/store'`
      }

      ${renderPreComponent({
        explicitImportFileExtension: options.explicitImportFileExtension,
        component: json,
        target: 'svelte',
      })}

      ${!hasData || options.stateType === 'variables' ? '' : `import onChange from 'on-change'`}
      ${props
        .map((name) => {
          if (name === 'children') {
            return '';
          }

          let propDeclaration = `export let ${name}`;

          if (options.typescript && json.propsTypeRef && json.propsTypeRef !== 'any') {
            propDeclaration += `: ${json.propsTypeRef.split(' |')[0]}['${name}']`;
          }

          if (json.defaultProps && json.defaultProps.hasOwnProperty(name)) {
            propDeclaration += `=${json.defaultProps[name]?.code}`;
          } else if (json.props?.[name]?.optional) {
            propDeclaration += `= undefined`;
          }

          propDeclaration += ';';

          return propDeclaration;
        })
        .join('\n')}
      ${
        // https://github.com/sveltejs/svelte/issues/7311
        hasStyle(json)
          ? dedent`
        	function stringifyStyles(stylesObj) {
            let styles = '';
            for (let key in stylesObj) {
              const dashedKey = key.replace(/[A-Z]/g, function(match) {
                return '-' + match.toLowerCase();
              });
              styles += dashedKey + ":" + stylesObj[key] + ";";
            }
            return styles;
          }
      `
          : ''
      }
      ${getContextCode(json)}

      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}

      ${refs.map((ref) => `let ${ref}`).join('\n')}

      ${
        options.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }
      ${json.hooks.onInit?.code ?? ''}

      ${json.hooks.onMount.map((hook) => `onMount(() => { ${hook.code} });`).join('\n')}

      ${
        json.hooks.onUpdate
          ?.map(({ code, deps }, index) => {
            if (!deps) {
              return `afterUpdate(() => { ${code} });`;
            }

            const fnName = `onUpdateFn_${index}`;
            const depsArray = deps
              .slice(1, deps.length - 1)
              .split(',')
              .map((x) => x.trim());
            const getReactiveDepName = (dep: string) =>
              `${fnName}_${dep.slice(1).replace(/(\.|\?)/g, '_')}`;

            const isStoreAccessDep = (dep: string) => dep.startsWith('$');

            const reactiveDepsWorkaround = depsArray
              .filter(isStoreAccessDep)
              .map((dep) => `$: ${getReactiveDepName(dep)} = ${dep};`)
              .join('\n');

            const depsArrayStr = depsArray
              .map((x) => (isStoreAccessDep(x) ? getReactiveDepName(x) : x))
              .join(', ');

            /**
             * We create a reactive value for each `onUpdate`'s dependency that
             * accesses a store so that Svelte has accurate dependency tracking.
             *
             * Otherwise, if the dependency is a value within a store, Svelte will
             * rerun the effect every time the parent store is changed in any way.
             */
            return `
              function ${fnName}(..._args${options.typescript ? ': any[]' : ''}) {
                ${code}
              }
              ${reactiveDepsWorkaround}
              $: ${fnName}(...[${depsArrayStr}]);
            `;
          })
          .join('\n') || ''
      }

      ${
        // make sure this is after all other state/code is initialized
        setContextCode({ json, options })
      }

      ${!json.hooks.onUnMount?.code ? '' : `onDestroy(() => { ${json.hooks.onUnMount.code} });`}
    </script>

    ${json.children
      .map((item) =>
        blockToSvelte({
          json: item,
          options: options,
          parentComponent: json,
        }),
      )
      .join('\n')}

    ${
      !css.trim().length
        ? ''
        : `<style>
      ${css}
    </style>`
    }
  `;

    str = runPreCodePlugins({ json, code: str, plugins: options.plugins });

    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'svelte',
          plugins: [
            // To support running in browsers
            prettierParserHtml,
            prettierParserPostcss,
            prettierParserBabel,
            prettierParserTypescript,
            prettierPluginSvelte,
          ],
        });
      } catch (err) {
        console.warn('Could not prettify');
        console.warn(str, err);
      }
    }

    str = str.replace(/<script>\n<\/script>/g, '').trim();

    str = runPostCodePlugins({ json, code: str, plugins: options.plugins });

    return str;
  };
