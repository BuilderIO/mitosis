import dedent from 'dedent';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { collectCss } from '../../helpers/styles/collect-css';
import { hasStyle } from '../../helpers/styles/helpers';
import { fastClone } from '../../helpers/fast-clone';
import { getProps } from '../../helpers/get-props';
import { getRefs } from '../../helpers/get-refs';
import {
  stringifyContextValue,
  getStateObjectStringFromComponent,
} from '../../helpers/get-state-object-string';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { renderPreComponent } from '../../helpers/render-imports';
import { MitosisComponent } from '../../types/mitosis-component';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import { TranspilerGenerator } from '../../types/transpiler';
import { gettersToFunctions } from '../../helpers/getters-to-functions';
import { babelTransformCode } from '../../helpers/babel-transform';
import { flow, pipe } from 'fp-ts/lib/function';
import { hasContext } from '../helpers/context';
import { isSlotProperty } from '../../helpers/slots';
import json5 from 'json5';
import { FUNCTION_HACK_PLUGIN } from '../helpers/functions';
import { mergeOptions } from '../../helpers/merge-options';
import { CODE_PROCESSOR_PLUGIN } from '../../helpers/plugins/process-code';
import { stripStateAndProps } from './helpers';
import { ToSvelteOptions } from './types';
import { blockToSvelte } from './blocks';
import { stripGetter } from '../../helpers/patterns';

const getContextCode = (json: MitosisComponent) => {
  const contextGetters = json.context.get;
  return Object.entries(contextGetters)
    .map(([key, context]): string => {
      const { name } = context;

      return `let ${key} = getContext(${name}.key);`;
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
      const key = value ? `${name}.key` : name;

      const valueStr = value
        ? processCode(stringifyContextValue(value))
        : ref
        ? processCode(ref)
        : 'undefined';

      return `setContext(${key}, ${valueStr});`;
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
  plugins: [FUNCTION_HACK_PLUGIN],
};

export const componentToSvelte: TranspilerGenerator<ToSvelteOptions> =
  (userProvidedOptions) =>
  ({ component }) => {
    const options = mergeOptions(DEFAULT_OPTIONS, userProvidedOptions);

    options.plugins = [
      ...(options.plugins || []),
      CODE_PROCESSOR_PLUGIN((codeType) => {
        switch (codeType) {
          case 'hooks':
            return flow(stripStateAndProps({ json, options }), babelTransformCode);
          case 'bindings':
          case 'hooks-deps':
          case 'state':
            return flow(stripStateAndProps({ json, options }), stripGetter);
          case 'properties':
            return stripStateAndProps({ json, options });
        }
      }),
    ];

    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    json = runPreJsonPlugins(json, options.plugins);

    const refs = Array.from(getRefs(json));
    useBindValue(json, options);

    gettersToFunctions(json);

    const props = Array.from(getProps(json)).filter((prop) => !isSlotProperty(prop));

    json = runPostJsonPlugins(json, options.plugins);

    const css = collectCss(json);
    stripMetaProperties(json);

    const dataString = pipe(
      getStateObjectStringFromComponent(json, {
        data: true,
        functions: false,
        getters: false,
        format: options.stateType === 'proxies' ? 'object' : 'variables',
        keyPrefix: options.stateType === 'variables' ? 'let ' : '',
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

    if (json.hooks.onMount?.code?.length) {
      svelteImports.push('onMount');
    }
    if (json.hooks.onUpdate?.length) {
      svelteImports.push('afterUpdate');
    }
    if (json.hooks.onUnMount?.code?.length) {
      svelteImports.push('onDestroy');
    }
    if (hasContext(component)) {
      svelteImports.push('getContext', 'setContext');
    }

    str += dedent`
      <script ${tsLangAttribute}>
      ${!svelteImports.length ? '' : `import { ${svelteImports.sort().join(', ')} } from 'svelte'`}
      ${
        !svelteStoreImports.length
          ? ''
          : `import { ${svelteStoreImports.sort().join(', ')} } from 'svelte/store'`
      }

      ${renderPreComponent({ component: json, target: 'svelte' })}

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
            propDeclaration += `=${json5.stringify(json.defaultProps[name])}`;
          }

          propDeclaration += ';';

          return propDeclaration;
        })
        .join('\n')}
      ${
        // https://svelte.dev/repl/bd9b56891f04414982517bbd10c52c82?version=3.31.0
        hasStyle(json)
          ? `
        function mitosis_styling (node, vars) {
          Object.entries(vars || {}).forEach(([ p, v ]) => {
            if (p.startsWith('--')) {
              node.style.setProperty(p, v);
            } else {
              node.style[p] = v;
            }
          })
        }
      `
          : ''
      }
      ${getContextCode(json)}
      ${setContextCode({ json, options })}

      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}

      ${refs.map((ref) => `let ${stripStateAndProps({ json, options })(ref)}`).join('\n')}

      ${
        options.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }
      ${json.hooks.onInit?.code ?? ''}
      
      ${!json.hooks.onMount?.code ? '' : `onMount(() => { ${json.hooks.onMount.code} });`}

      ${
        json.hooks.onUpdate
          ?.map(({ code, deps }, index) => {
            if (!deps) {
              return `afterUpdate(() => { ${code} });`;
            }

            const fnName = `onUpdateFn_${index}`;
            return `
              function ${fnName}() {
                ${code}
              }
              $: ${fnName}(...${deps})
            `;
          })
          .join(';') || ''
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

    str = runPreCodePlugins(str, options.plugins);

    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'svelte',
          plugins: [
            // To support running in browsers
            require('prettier/parser-html'),
            require('prettier/parser-postcss'),
            require('prettier/parser-babel'),
            require('prettier/parser-typescript'),
            require('prettier-plugin-svelte'),
          ],
        });
      } catch (err) {
        console.warn('Could not prettify');
        console.warn({ string: str }, err);
      }
    }
    str = runPostCodePlugins(str, options.plugins);

    return str;
  };
