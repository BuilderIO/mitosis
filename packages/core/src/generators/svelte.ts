import dedent from 'dedent';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { collectCss } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getProps } from '../helpers/get-props';
import { getRefs } from '../helpers/get-refs';
import {
  getMemberObjectString,
  getStateObjectStringFromComponent,
} from '../helpers/get-state-object-string';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import isChildren from '../helpers/is-children';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { removeSurroundingBlock } from '../helpers/remove-surrounding-block';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { babelTransformCode } from '../helpers/babel-transform';
import { pipe } from 'fp-ts/lib/function';
import { hasContext } from './helpers/context';
import { VALID_HTML_TAGS } from '../constants/html_tags';

export interface ToSvelteOptions extends BaseTranspilerOptions {
  stateType?: 'proxies' | 'variables';
}

const mappers: {
  [key: string]: BlockToSvelte;
} = {
  Fragment: ({ json, options, parentComponent }) => {
    if (json.bindings.innerHTML?.code) {
      return BINDINGS_MAPPER.innerHTML(json, options);
    } else if (json.children.length > 0) {
      return `${json.children
        .map((item) => blockToSvelte({ json: item, options, parentComponent }))
        .join('\n')}`;
    } else {
      return '';
    }
  },
  For: ({ json, options, parentComponent }) => {
    return `
{#each ${stripStateAndPropsRefs(json.bindings.each?.code as string, {
      includeState: options.stateType === 'variables',
    })} as ${json.properties._forName}, index }
${json.children
  .map((item) => blockToSvelte({ json: item, options, parentComponent }))
  .join('\n')}
{/each}
`;
  },
  Show: ({ json, options, parentComponent }) => {
    return `
{#if ${stripStateAndPropsRefs(json.bindings.when?.code as string, {
      includeState: options.stateType === 'variables',
    })} }
${json.children
  .map((item) => blockToSvelte({ json: item, options, parentComponent }))
  .join('\n')}

  ${
    json.meta.else
      ? `
  {:else}
  ${blockToSvelte({
    json: json.meta.else as MitosisNode,
    options,
    parentComponent,
  })}
  `
      : ''
  }
{/if}`;
  },
};

const getContextCode = (json: MitosisComponent) => {
  const contextGetters = json.context.get;
  return Object.keys(contextGetters)
    .map((key) => `let ${key} = getContext(${contextGetters[key].name}.key);`)
    .join('\n');
};

const setContextCode = (json: MitosisComponent) => {
  const contextSetters = json.context.set;
  return Object.keys(contextSetters)
    .map((key) => {
      const { value, name } = contextSetters[key];
      return `setContext(${name}.key, ${
        value
          ? stripStateAndPropsRefs(getMemberObjectString(value))
          : 'undefined'
      });`;
    })
    .join('\n');
};

const BINDINGS_MAPPER = {
  innerHTML: (json: MitosisNode, options: ToSvelteOptions) =>
    `{@html ${stripStateAndPropsRefs(
      json.bindings.innerHTML?.code as string,
    )}}`,
};

interface BlockToSvelteProps {
  json: MitosisNode;
  options: ToSvelteOptions;
  parentComponent: MitosisComponent;
}

const SVELTE_SPECIAL_TAGS = {
  COMPONENT: 'svelte:component',
  ELEMENT: 'svelte:element',
  SELF: 'svelte:self',
};
const getTagName = ({
  json,
  parentComponent,
}: {
  json: MitosisNode;
  parentComponent: MitosisComponent;
}) => {
  if (parentComponent && json.name === parentComponent.name) {
    return SVELTE_SPECIAL_TAGS.SELF;
  }

  const isValidHtmlTag = VALID_HTML_TAGS.includes(json.name);
  const isSpecialSvelteTag = json.name.startsWith('svelte:');
  // Check if any import matches `json.name`
  const hasMatchingImport = parentComponent.imports.some(({ imports }) =>
    Object.keys(imports).some((name) => name === json.name),
  );
  // TO-DO: no way to decide between <svelte:component> and <svelte:element>...need to do that through metadata
  // overrides for now
  if (!isValidHtmlTag && !isSpecialSvelteTag && !hasMatchingImport) {
    json.bindings.this = { code: json.name };
    return SVELTE_SPECIAL_TAGS.COMPONENT;
  }

  return json.name;
};

type BlockToSvelte = (props: BlockToSvelteProps) => string;

export const blockToSvelte: BlockToSvelte = ({
  json,
  options,
  parentComponent,
}) => {
  if (mappers[json.name]) {
    return mappers[json.name]({ json, options, parentComponent });
  }

  const tagName = getTagName({ json, parentComponent });

  if (isChildren(json)) {
    return `<slot></slot>`;
  }

  if (json.properties._text) {
    return json.properties._text;
  }

  if (json.bindings._text?.code) {
    return `{${stripStateAndPropsRefs(json.bindings._text.code as string, {
      includeState: options.stateType === 'variables',
    })}}`;
  }

  let str = '';

  str += `<${tagName} `;

  if (json.bindings._spread?.code) {
    str += `{...${stripStateAndPropsRefs(json.bindings._spread.code as string, {
      includeState: options.stateType === 'variables',
    })}}`;
  }

  for (const key in json.properties) {
    const value = json.properties[key];
    str += ` ${key}="${value}" `;
  }
  for (const key in json.bindings) {
    if (key === 'innerHTML') {
      continue;
    }
    if (key === '_spread') {
      continue;
    }
    const { code: value } = json.bindings[key]!;
    // TODO: proper babel transform to replace. Util for this
    const useValue = stripStateAndPropsRefs(value, {
      includeState: options.stateType === 'variables',
    });

    if (key.startsWith('on')) {
      const event = key.replace('on', '').toLowerCase();
      // TODO: handle quotes in event handler values
      str += ` on:${event}="{event => ${removeSurroundingBlock(useValue)}}" `;
    } else if (key === 'ref') {
      str += ` bind:this={${useValue}} `;
    } else {
      str += ` ${key}={${useValue}} `;
    }
  }
  // if we have innerHTML, it doesn't matter whether we have closing tags or not, or children or not.
  // we use the innerHTML content as children and don't render the self-closing tag.
  if (json.bindings.innerHTML?.code) {
    str += '>';
    str += BINDINGS_MAPPER.innerHTML(json, options);
    str += `</${tagName}>`;
    return str;
  }

  if (selfClosingTags.has(tagName)) {
    return str + ' />';
  }
  str += '>';
  if (json.children) {
    str += json.children
      .map((item) => blockToSvelte({ json: item, options, parentComponent }))
      .join('\n');
  }

  str += `</${tagName}>`;

  return str;
};

/**
 * Replace
 *    <input value={state.name} onChange={event => state.name = event.target.value}
 * with
 *    <input bind:value={state.name}/>
 * when easily identified, for more idiomatic svelte code
 */
const useBindValue = (json: MitosisComponent, options: ToSvelteOptions) => {
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const { value, onChange } = item.bindings;
      if (value && onChange) {
        if (
          (onChange.code as string).replace(/\s+/g, '') ===
          `${value.code}=event.target.value`
        ) {
          delete item.bindings.value;
          delete item.bindings.onChange;
          item.bindings['bind:value'] = value;
        }
      }
    }
  });
};
/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string) => {
  return str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');
};

export const componentToSvelte =
  (options: ToSvelteOptions = {}): Transpiler =>
  ({ component }) => {
    const useOptions: ToSvelteOptions = {
      ...options,
      stateType: 'variables',
    };
    // Make a copy we can safely mutate, similar to babel's toolchain
    let json = fastClone(component);
    if (useOptions.plugins) {
      json = runPreJsonPlugins(json, useOptions.plugins);
    }

    const refs = Array.from(getRefs(json));
    useBindValue(json, useOptions);

    gettersToFunctions(json);

    if (useOptions.plugins) {
      json = runPostJsonPlugins(json, useOptions.plugins);
    }
    const css = collectCss(json);
    stripMetaProperties(json);

    const dataString = pipe(
      getStateObjectStringFromComponent(json, {
        data: true,
        functions: false,
        getters: false,
        format: useOptions.stateType === 'proxies' ? 'object' : 'variables',
        keyPrefix: useOptions.stateType === 'variables' ? 'let ' : '',
        valueMapper: (code) =>
          stripStateAndPropsRefs(code, {
            includeState: useOptions.stateType === 'variables',
          }),
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
        valueMapper: (code) =>
          pipe(
            stripStateAndPropsRefs(
              code
                .replace(/^get ([a-zA-Z_\$0-9]+)/, '$1 = ')
                .replace(/\)/, ') => '),
              {
                includeState: useOptions.stateType === 'variables',
              },
            ),
            stripThisRefs,
          ),
      }),
      babelTransformCode,
    );

    const functionsString = pipe(
      getStateObjectStringFromComponent(json, {
        data: false,
        getters: false,
        functions: true,
        format: 'variables',
        keyPrefix: 'function ',
        valueMapper: (code) =>
          pipe(
            stripStateAndPropsRefs(code, {
              includeState: useOptions.stateType === 'variables',
            }),
            stripThisRefs,
          ),
      }),
      babelTransformCode,
    );

    const hasData = dataString.length > 4;

    const props = Array.from(getProps(json));

    const transformHookCode = (hookCode: string) =>
      pipe(
        stripStateAndPropsRefs(hookCode, {
          includeState: useOptions.stateType === 'variables',
        }),
        babelTransformCode,
      );

    let str = dedent`
    <script>
      ${!json.hooks.onMount?.code ? '' : `import { onMount } from 'svelte'`}
      ${
        !json.hooks.onUpdate?.length
          ? ''
          : `import { afterUpdate } from 'svelte'`
      }
      ${!json.hooks.onUnMount?.code ? '' : `import { onDestroy } from 'svelte'`}
      ${renderPreComponent(json, 'svelte')}
      ${
        hasContext(component)
          ? 'import { getContext, setContext } from "svelte";'
          : ''
      }

      ${
        !hasData || useOptions.stateType === 'variables'
          ? ''
          : `import onChange from 'on-change'`
      }
      ${refs
        .concat(props)
        .map((name) => {
          if (name === 'children') {
            return '';
          }
          return `export let ${name};`;
        })
        .join('\n')}
      
      ${functionsString.length < 4 ? '' : functionsString}
      ${getterString.length < 4 ? '' : getterString}

      ${getContextCode(json)}
      ${setContextCode(json)}
      ${
        useOptions.stateType === 'proxies'
          ? dataString.length < 4
            ? ''
            : `let state = onChange(${dataString}, () => state = state)`
          : dataString
      }

      ${
        !json.hooks.onMount?.code
          ? ''
          : `onMount(() => { ${transformHookCode(json.hooks.onMount.code)} });`
      }

      ${
        !json.hooks.onUpdate?.length
          ? ''
          : json.hooks.onUpdate
              .map(
                (hook) =>
                  `afterUpdate(() => { ${transformHookCode(hook.code)} })`,
              )
              .join(';')
      }

      ${
        !json.hooks.onUnMount?.code
          ? ''
          : `onDestroy(() => { ${transformHookCode(
              json.hooks.onUnMount.code,
            )} });`
      }
    </script>

    ${json.children
      .map((item) =>
        blockToSvelte({
          json: item,
          options: useOptions,
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

    if (useOptions.plugins) {
      str = runPreCodePlugins(str, useOptions.plugins);
    }
    if (useOptions.prettier !== false) {
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
        console.warn('Could not prettify', { string: str }, err);
      }
    }
    if (useOptions.plugins) {
      str = runPostCodePlugins(str, useOptions.plugins);
    }
    return str;
  };
