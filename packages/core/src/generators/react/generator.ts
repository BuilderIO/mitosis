import json5 from 'json5';
import { format } from 'prettier/standalone';
import { TranspilerGenerator } from '../../types/transpiler';
import { collectCss } from '../../helpers/styles/collect-css';
import { dedent } from '../../helpers/dedent';
import { fastClone } from '../../helpers/fast-clone';
import { getPropsRef } from '../../helpers/get-props-ref';
import { getStateObjectStringFromComponent } from '../../helpers/get-state-object-string';
import { gettersToFunctions } from '../../helpers/getters-to-functions';
import { handleMissingState } from '../../helpers/handle-missing-state';
import { mapRefs } from '../../helpers/map-refs';
import { processHttpRequests } from '../../helpers/process-http-requests';
import { processTagReferences } from '../../helpers/process-tag-references';
import { renderPreComponent } from '../../helpers/render-imports';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { collectReactNativeStyles } from '../react-native';
import { collectStyledComponents } from '../../helpers/styles/collect-styled-components';
import { hasCss } from '../../helpers/styles/helpers';
import { checkHasState } from '../../helpers/state';
import { ToReactOptions } from './types';
import {
  getContextString,
  getHooksCode,
  getRefsString,
  getUseStateCode,
  updateStateSetters,
} from './state';
import { closeFrag, getFragment, isRootSpecialNode, openFrag, processBinding, wrapInFragment } from './helpers';
import hash from 'hash-sum';
import {blockToReact, getNodeMappers, REACT_BINDING_MAPPERS} from './blocks';
import { mergeOptions } from '../../helpers/merge-options';
import { stripNewlinesInStrings } from '../../helpers/replace-new-lines-in-strings';
import { isRootTextNode } from '../../helpers/is-root-text-node';
import { provideContext } from './context';
import { getFrameworkImports } from './imports';

const REACT_NODE_MAPPERS = getNodeMappers(REACT_BINDING_MAPPERS, {
  getFragment,
  openFrag,
  closeFrag
})


export const contextPropDrillingKey = '_context';

const getInitCode = (json: MitosisComponent, options: ToReactOptions): string => {
  return processBinding(json.hooks.init?.code || '', options);
};

const DEFAULT_OPTIONS: ToReactOptions = {
  stateType: 'useState',
  stylesType: 'styled-jsx',
  type: 'dom',
};

export const componentToReact: TranspilerGenerator<Partial<ToReactOptions>> =
  (reactOptions = {}) =>
  ({ component, path }) => {
    let json = fastClone(component);
    const options: ToReactOptions = mergeOptions(DEFAULT_OPTIONS, reactOptions);

    if (options.plugins) {
      json = runPreJsonPlugins(json, options.plugins);
    }

    let str = _componentToReact(json, options);

    str +=
      '\n\n\n' +
      json.subComponents.map((item) => _componentToReact(item, options, true)).join('\n\n\n');

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

// TODO: import target components when they are required
const getDefaultImport = (json: MitosisComponent, options: ToReactOptions): string => {
  const { type } = options;

  if (type === 'native') {
    return `
    import * as React from 'react';
    import { FlatList, ScrollView, View, StyleSheet, Image, Text } from 'react-native';
    `;
  }
  if (type === 'taro') {
    return `
    import * as React from 'react';
    `;
  }

  return "import * as React from 'react';";
};

const getPropsDefinition = ({ json }: { json: MitosisComponent }) => {
  if (!json.defaultProps) return '';
  const defaultPropsString = Object.keys(json.defaultProps)
    .map((prop) => {
      const value = json.defaultProps!.hasOwnProperty(prop)
        ? json.defaultProps![prop]?.code
        : 'undefined';
      return `${prop}: ${value}`;
    })
    .join(',');
  return `${json.name}.defaultProps = {${defaultPropsString}};`;
};

const _componentToReact = (
  json: MitosisComponent,
  options: ToReactOptions,
  isSubComponent = false,
) => {
  processHttpRequests(json);
  handleMissingState(json);
  processTagReferences(json);
  const contextStr = provideContext(json, options);
  const componentHasStyles = hasCss(json);
  if (options.stateType === 'useState') {
    gettersToFunctions(json);
    updateStateSetters(json, options);
  }

  if (!json.name) {
    json.name = 'MyComponent';
  }

  // const domRefs = getRefs(json);
  const allRefs = Object.keys(json.refs);
  mapRefs(json, (refName) => `${refName}.current`);

  let hasState = checkHasState(json);

  const [forwardRef, hasPropRef] = getPropsRef(json);
  const isForwardRef = Boolean(json.meta.useMetadata?.forwardRef || hasPropRef);
  if (isForwardRef) {
    const meta = json.meta.useMetadata?.forwardRef as string;
    options.forwardRef = meta || forwardRef;
  }
  const forwardRefType =
    options.typescript && json.propsTypeRef && forwardRef && json.propsTypeRef !== 'any'
      ? `<${json.propsTypeRef}["${forwardRef}"]>`
      : '';

  if (options.stateType === 'builder') {
    // Always use state if we are generate Builder react code
    hasState = true;
  }

  const useStateCode = options.stateType === 'useState' ? getUseStateCode(json, options) : '';
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

  const styledComponentsCode =
    (options.stylesType === 'styled-components' &&
      componentHasStyles &&
      collectStyledComponents(json)) ||
    '';

  if (options.format !== 'lite') {
    stripMetaProperties(json);
  }

  const reactLibImports = getFrameworkImports(json, {
    allRefs,
    useStateCode,
    dontUseContext: options.contextType === 'prop-drill',
  });

  if (hasPropRef) {
    reactLibImports.add('forwardRef');
  }

  const wrap =
    wrapInFragment(json) ||
    isRootTextNode(json) ||
    (componentHasStyles &&
      (options.stylesType === 'styled-jsx' || options.stylesType === 'style-tag')) ||
    isRootSpecialNode(json);

  const [hasStateArgument, refsString] = getRefsString(json, allRefs, options);

  // NOTE: `collectReactNativeStyles` must run before style generation in the component generation body, as it has
  // side effects that delete styles bindings from the JSON.
  const reactNativeStyles =
    options.stylesType === 'react-native' && componentHasStyles
      ? collectReactNativeStyles(json)
      : undefined;

  const propType = json.propsTypeRef || 'any';
  const componentArgs = [`props${options.typescript ? `:${propType}` : ''}`, options.forwardRef]
    .filter(Boolean)
    .join(',');

  const componentBody = dedent`
    ${
      options.contextType === 'prop-drill'
        ? `const ${contextPropDrillingKey} = { ...props['${contextPropDrillingKey}'] };`
        : ''
    }
    ${hasStateArgument ? '' : refsString}
    ${
      hasState
        ? options.stateType === 'mobx'
          ? `const state = useLocalObservable(() => (${getStateObjectStringFromComponent(json)}));`
          : options.stateType === 'useState'
          ? useStateCode
          : options.stateType === 'solid'
          ? `const state = useMutable(${getStateObjectStringFromComponent(json)});`
          : options.stateType === 'builder'
          ? `const state = useBuilderState(${getStateObjectStringFromComponent(json)});`
          : options.stateType === 'variables'
          ? `const state = ${getStateObjectStringFromComponent(json)};`
          : `const state = useLocalProxy(${getStateObjectStringFromComponent(json)});`
        : ''
    }
    ${hasStateArgument ? refsString : ''}
    ${getContextString(json, options)}
    ${getInitCode(json, options)}
    ${contextStr || ''}

    ${getHooksCode(json, options)}

    return (
      ${wrap ? openFrag() : ''}
      ${json.children.map((item) => blockToReact(item, options, json, REACT_NODE_MAPPERS, REACT_BINDING_MAPPERS, [])).join('\n')}
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
  ${styledComponentsCode ? `import styled from 'styled-components';\n` : ''}
  ${reactLibImports.size ? `import { ${Array.from(reactLibImports).join(', ')} } from 'react'` : ''}
  ${
    componentHasStyles && options.stylesType === 'emotion' && options.format !== 'lite'
      ? `/** @jsx jsx */
    import { jsx } from '@emotion/react'`.trim()
      : ''
  }
    ${
      !hasState
        ? ''
        : options.stateType === 'valtio'
        ? `import { useLocalProxy } from 'valtio/utils';`
        : options.stateType === 'solid'
        ? `import { useMutable } from 'react-solid-state';`
        : options.stateType === 'mobx'
        ? `import { useLocalObservable, observer } from 'mobx-react-lite';`
        : ''
    }
    ${json.types && options.typescript ? json.types.join('\n') : ''}
    ${renderPreComponent({
      component: json,
      target: options.type === 'native' ? 'reactNative' : 'react',
    })}
    ${isForwardRef ? `const ${json.name} = forwardRef${forwardRefType}(` : ''}function ${
    json.name
  }(${componentArgs}) {
    ${componentBody}
  }${isForwardRef ? ')' : ''}

    ${getPropsDefinition({ json })}

    ${
      reactNativeStyles
        ? `const styles = StyleSheet.create(${json5.stringify(reactNativeStyles)});`
        : ''
    }

    ${styledComponentsCode ?? ''}
    ${
      isSubComponent
        ? ''
        : options.stateType === 'mobx'
        ? `
      const observed${json.name} = observer(${json.name});
      export default observed${json.name};
    `
        : `export default ${json.name};`
    }

  `;

  return stripNewlinesInStrings(str);
};
