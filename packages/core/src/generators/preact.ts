import { fastClone } from '../helpers/fast-clone';
import { blockToReact, ToReactOptions } from './react';
import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { mergeOptions } from '../helpers/merge-options';
import { MitosisComponent } from '@builder.io/mitosis';
import { processHttpRequests } from '../helpers/process-http-requests';
import { handleMissingState } from '../helpers/handle-missing-state';
import { processTagReferences } from '../helpers/process-tag-references';
import { provideContext } from './react/context';
import { hasCss } from '../helpers/styles/helpers';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import {
  getContextString,
  getHooksCode,
  getRefsString,
  getUseStateCode,
  updateStateSetters,
} from './react/state';
import { mapRefs } from '../helpers/map-refs';
import { checkHasState } from '../helpers/state';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { collectCss } from '../helpers/styles/collect-css';
import hash from 'hash-sum';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { isRootSpecialNode, processBinding, wrapInFragment } from './react/helpers';
import { isRootTextNode } from '../helpers/is-root-text-node';
import dedent from 'dedent';
import { renderPreComponent } from '../helpers/render-imports';
import { stripNewlinesInStrings } from '../helpers/replace-new-lines-in-strings';
import { getFrameworkImports } from './react/imports';
import { format } from 'prettier/standalone';
import { ATTTRIBUTE_MAPPERS, BindingMapper, getNodeMappers } from './react/blocks';
import { getPropsDefinition } from './react/props';

export const openFrag = () => getFragment('open');
export const closeFrag = () => getFragment('close');
export function getFragment(type: 'open' | 'close') {
  return type === 'open' ? `<Fragment>` : `</Fragment>`;
}

// TODO: Maybe in the future allow defining `string | function` as values
const PREACT_BINDING_MAPPERS: {
  [key: string]: BindingMapper;
} = {
  innerHTML(_key, value) {
    return ['dangerouslySetInnerHTML', `{__html: ${value.replace(/\s+/g, ' ')}}`];
  },
  ...ATTTRIBUTE_MAPPERS,
};

export interface ToPreactOptions extends BaseTranspilerOptions {
  stylesType: 'styled-jsx' | 'style-tag';
  format?: 'lite' | 'safe';
}

const getInitCode = (
  json: MitosisComponent,
  options: Parameters<typeof processBinding>[1],
): string => {
  return processBinding(json.hooks.init?.code || '', options);
};

const DEFAULT_OPTIONS: ToPreactOptions = {
  stylesType: 'styled-jsx',
};

// TODO: import target components when they are required
const getDefaultImport = (json: MitosisComponent, options: ToPreactOptions): string => {
  return `
  /** @jsx h */
  import { h, Fragment } from 'preact';
  `;
};

export const componentToPreact: TranspilerGenerator<Partial<ToPreactOptions>> =
  (preactOptions = {}) =>
  ({ component, path }) => {
    let json = fastClone(component);
    const options: ToPreactOptions = mergeOptions(DEFAULT_OPTIONS, preactOptions);

    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }

    let str = _componentToPreact(json, options);

    str +=
      '\n\n\n' +
      json.subComponents.map((item) => _componentToPreact(item, options, true)).join('\n\n\n');

    if (options.plugins) {
      str = runPreCodePlugins(str, options.plugins);
    }
    if (options.prettier !== false) {
      try {
        str = format(str, {
          parser: 'typescript',
          plugins: [
            require('prettier/parser-typescript'), // To support running in browsers
            require('prettier/parser-postcss'),
          ],
        })
          // Remove spaces between imports
          .replace(/;\n\nimport\s/g, ';\nimport ');
      } catch (err) {
        console.error('Format error for file:');
        throw err;
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
  };

const PREACT_NODE_MAPPERS = getNodeMappers(PREACT_BINDING_MAPPERS, {
  getFragment,
  openFrag,
  closeFrag,
});

const _componentToPreact = (
  json: MitosisComponent,
  options: ToPreactOptions,
  isSubComponent = false,
) => {
  processHttpRequests(json);
  handleMissingState(json);
  processTagReferences(json);
  const _options = {
    ...options,
    contextType: 'context',
    stateType: 'useState',
    type: 'dom',
  } as Omit<ToReactOptions, keyof ToPreactOptions> & ToPreactOptions;
  const contextStr = provideContext(json, _options);
  const componentHasStyles = hasCss(json);
  gettersToFunctions(json);
  updateStateSetters(json, _options);

  if (!json.name) {
    json.name = 'MyComponent';
  }

  // const domRefs = getRefs(json);
  const allRefs = Object.keys(json.refs);
  mapRefs(json, (refName) => `${refName}.current`);

  let hasState = checkHasState(json);

  const useStateCode = getUseStateCode(json, _options);
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }

  const css =
    options.stylesType === 'styled-jsx'
      ? collectCss(json)
      : options.stylesType === 'style-tag'
      ? collectCss(json, {
          prefix: hash(json),
        })
      : null;

  if (options.format !== 'lite') {
    stripMetaProperties(json);
  }

  const preactLibImports = getFrameworkImports(json, {
    allRefs,
    useStateCode,
  });

  const wrap =
    wrapInFragment(json) ||
    isRootTextNode(json) ||
    (componentHasStyles &&
      (options.stylesType === 'styled-jsx' || options.stylesType === 'style-tag')) ||
    isRootSpecialNode(json);

  const [hasStateArgument, refsString] = getRefsString(json, allRefs, _options);

  const propType = json.propsTypeRef || 'any';
  const componentArgs = `props${options.typescript ? `:${propType}` : ''}`;

  const componentBody = dedent`
    ${hasStateArgument ? '' : refsString}
    ${hasState ? useStateCode : ''}
    ${hasStateArgument ? refsString : ''}
    ${getContextString(json, _options)}
    ${getInitCode(json, _options)}
    ${contextStr || ''}

    ${getHooksCode(json, _options)}

    return (
      ${wrap ? openFrag() : ''}
      ${json.children
        .map((item) =>
          blockToReact(item, _options, json, PREACT_NODE_MAPPERS, PREACT_BINDING_MAPPERS, []),
        )
        .join('\n')}
      ${
        componentHasStyles && options.stylesType === 'styled-jsx'
          ? `<style jsx>{\`${css}\`}</style>`
          : componentHasStyles && options.stylesType === 'style-tag'
          ? `<style>{\`${css}\`}</style>`
          : ''
      }
      ${wrap ? closeFrag() : ''}
    );
  `;

  const str = dedent`
  ${getDefaultImport(json, options)}
  ${
    preactLibImports.size
      ? `import { ${Array.from(preactLibImports).join(', ')} } from 'preact/hooks'`
      : ''
  }
    ${json.types && options.typescript ? json.types.join('\n') : ''}
    ${renderPreComponent({
      component: json,
      target: 'preact',
    })}
    function ${json.name}(${componentArgs}) {
    ${componentBody}
  }

    ${getPropsDefinition({ json })}


    ${isSubComponent ? '' : `export default ${json.name};`}

  `;

  return stripNewlinesInStrings(str);
};
