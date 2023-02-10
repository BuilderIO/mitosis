import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { TranspilerGenerator } from '../../types/transpiler';
import { collectCss } from '../../helpers/styles/collect-css';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { fastClone } from '../../helpers/fast-clone';
import { getRefs } from '../../helpers/get-refs';
import { getPropsRef } from '../../helpers/get-props-ref';
import {
  stringifyContextValue,
  getStateObjectStringFromComponent,
} from '../../helpers/get-state-object-string';
import { gettersToFunctions } from '../../helpers/getters-to-functions';
import { handleMissingState } from '../../helpers/handle-missing-state';
import { mapRefs } from '../../helpers/map-refs';
import { processHttpRequests } from '../../helpers/process-http-requests';
import { processTagReferences } from '../../helpers/process-tag-references';
import { renderPreComponent } from '../../helpers/render-imports';
import { stripNewlinesInStrings } from '../../helpers/replace-new-lines-in-strings';
import { stripMetaProperties } from '../../helpers/strip-meta-properties';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../../modules/plugins';
import { MitosisComponent } from '../../types/mitosis-component';
import { hasContext } from '../helpers/context';
import { collectReactNativeStyles } from '../react-native';
import { collectStyledComponents } from '../../helpers/styles/collect-styled-components';
import { hasCss } from '../../helpers/styles/helpers';
import { checkHasState } from '../../helpers/state';
import { ToReactOptions } from './types';
import { getUseStateCode, processHookCode, updateStateSetters } from './state';
import { closeFrag, openFrag, processBinding, wrapInFragment } from './helpers';
import hash from 'hash-sum';
import { createSingleBinding } from '../../helpers/bindings';
import { blockToReact } from './blocks';

export const contextPropDrillingKey = '_context';

/**
 * If the root Mitosis component only has 1 child, and it is a `Show`/`For` node, then we need to wrap it in a fragment.
 * Otherwise, we end up with invalid React render code.
 *
 */
const isRootSpecialNode = (json: MitosisComponent) =>
  json.children.length === 1 && ['Show', 'For'].includes(json.children[0].name);

const getRefsString = (json: MitosisComponent, refs: string[], options: ToReactOptions) => {
  let hasStateArgument = false;
  let code = '';
  const domRefs = getRefs(json);

  for (const ref of refs) {
    const typeParameter = json['refs'][ref]?.typeParameter || '';
    // domRefs must have null argument
    const argument = json['refs'][ref]?.argument || (domRefs.has(ref) ? 'null' : '');
    hasStateArgument = /state\./.test(argument);
    code += `\nconst ${ref} = useRef${
      typeParameter && options.typescript ? `<${typeParameter}>` : ''
    }(${processHookCode({
      str: argument,
      options,
    })});`;
  }

  return [hasStateArgument, code];
};

function provideContext(json: MitosisComponent, options: ToReactOptions): string | void {
  if (options.contextType === 'prop-drill') {
    let str = '';
    for (const key in json.context.set) {
      const { name, ref, value } = json.context.set[key];
      if (value) {
        str += `
          ${contextPropDrillingKey}.${name} = ${stringifyContextValue(value)};
        `;
      }
      // TODO: support refs. I'm not sure what those are so unclear how to support them
    }
    return str;
  } else {
    for (const key in json.context.set) {
      const { name, ref, value } = json.context.set[key];
      if (value) {
        json.children = [
          createMitosisNode({
            name: `${name}.Provider`,
            children: json.children,
            ...(value && {
              bindings: {
                value: createSingleBinding({
                  code: stringifyContextValue(value),
                }),
              },
            }),
          }),
        ];
      } else if (ref) {
        json.children = [
          createMitosisNode({
            name: 'Context.Provider',
            children: json.children,
            ...(ref && {
              bindings: {
                value: createSingleBinding({ code: ref }),
              },
            }),
          }),
        ];
      }
    }
  }
}

function getContextString(component: MitosisComponent, options: ToReactOptions) {
  let str = '';
  for (const key in component.context.get) {
    if (options.contextType === 'prop-drill') {
      str += `
        const ${key} = ${contextPropDrillingKey}['${component.context.get[key].name}'];
      `;
    } else {
      str += `
        const ${key} = useContext(${component.context.get[key].name});
      `;
    }
  }

  return str;
}

const getInitCode = (json: MitosisComponent, options: ToReactOptions): string => {
  return processBinding(json.hooks.init?.code || '', options);
};

type ReactExports =
  | 'useState'
  | 'useRef'
  | 'useCallback'
  | 'useEffect'
  | 'useContext'
  | 'forwardRef';

const DEFAULT_OPTIONS: ToReactOptions = {
  stateType: 'useState',
  stylesType: 'styled-jsx',
};

export const componentToPreact: TranspilerGenerator<ToReactOptions> = (reactOptions = {}) =>
  componentToReact({
    ...reactOptions,
    preact: true,
  });

export const componentToReact: TranspilerGenerator<ToReactOptions> =
  (reactOptions = {}) =>
  ({ component }) => {
    let json = fastClone(component);
    const options: ToReactOptions = {
      ...DEFAULT_OPTIONS,
      ...reactOptions,
    };
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
        console.error('Format error for file:', str, JSON.stringify(json, null, 2));
        throw err;
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins(str, options.plugins);
    }
    return str;
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
    json.propsTypeRef && forwardRef && json.propsTypeRef !== 'any'
      ? `${json.propsTypeRef}["${forwardRef}"]`
      : undefined;

  const stylesType = options.stylesType || 'emotion';
  const stateType = options.stateType || 'mobx';
  if (stateType === 'builder') {
    // Always use state if we are generate Builder react code
    hasState = true;
  }

  const useStateCode = stateType === 'useState' && getUseStateCode(json, options);
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }

  const css =
    stylesType === 'styled-jsx'
      ? collectCss(json)
      : stylesType === 'style-tag'
      ? collectCss(json, {
          prefix: hash(json),
        })
      : null;

  const styledComponentsCode =
    stylesType === 'styled-components' && componentHasStyles && collectStyledComponents(json);

  if (options.format !== 'lite') {
    stripMetaProperties(json);
  }

  const reactLibImports: Set<ReactExports> = new Set();
  if (useStateCode && useStateCode.includes('useState')) {
    reactLibImports.add('useState');
  }
  if (hasContext(json) && options.contextType !== 'prop-drill') {
    reactLibImports.add('useContext');
  }
  if (allRefs.length) {
    reactLibImports.add('useRef');
  }
  if (hasPropRef) {
    reactLibImports.add('forwardRef');
  }
  if (
    json.hooks.onMount?.code ||
    json.hooks.onUnMount?.code ||
    json.hooks.onUpdate?.length ||
    json.hooks.onInit?.code
  ) {
    reactLibImports.add('useEffect');
  }

  const wrap =
    wrapInFragment(json) ||
    (componentHasStyles && (stylesType === 'styled-jsx' || stylesType === 'style-tag')) ||
    isRootSpecialNode(json);

  const [hasStateArgument, refsString] = getRefsString(json, allRefs, options);
  const nativeStyles =
    stylesType === 'react-native' && componentHasStyles && collectReactNativeStyles(json);

  const propType = json.propsTypeRef || 'any';
  const propsArgs = `props${options.typescript ? `:${propType}` : ''}`;

  const getPropsDefinition = ({ json }: { json: MitosisComponent }) => {
    if (!json.defaultProps) return '';
    const defalutPropsString = Object.keys(json.defaultProps)
      .map((prop) => {
        const value = json.defaultProps!.hasOwnProperty(prop)
          ? json.defaultProps![prop]?.code
          : 'undefined';
        return `${prop}: ${value}`;
      })
      .join(',');
    return `${json.name || 'MyComponent'}.defaultProps = {${defalutPropsString}};`;
  };

  let str = dedent`
  ${
    options.preact
      ? `
    /** @jsx h */
    import { h, Fragment } from 'preact';
    `
      : options.type !== 'native'
      ? "import * as React from 'react';"
      : `
  import * as React from 'react';
  import { FlatList, ScrollView, View, StyleSheet, Image, Text } from 'react-native';
  `
  }
  ${styledComponentsCode ? `import styled from 'styled-components';\n` : ''}
  ${
    reactLibImports.size
      ? `import { ${Array.from(reactLibImports).join(', ')} } from '${
          options.preact ? 'preact/hooks' : 'react'
        }'`
      : ''
  }
  ${
    componentHasStyles && stylesType === 'emotion' && options.format !== 'lite'
      ? `/** @jsx jsx */
    import { jsx } from '@emotion/react'`.trim()
      : ''
  }
    ${hasState && stateType === 'valtio' ? `import { useLocalProxy } from 'valtio/utils';` : ''}
    ${hasState && stateType === 'solid' ? `import { useMutable } from 'react-solid-state';` : ''}
    ${
      stateType === 'mobx' && hasState
        ? `import { useLocalObservable, observer } from 'mobx-react-lite';`
        : ''
    }
    ${json.types && options.typescript ? json.types.join('\n') : ''}
    ${renderPreComponent({
      component: json,
      target: options.type === 'native' ? 'reactNative' : 'react',
    })}
    ${stateType === 'mobx' && isForwardRef ? `const ${json.name || 'MyComponent'} = ` : ``}${
    isSubComponent || stateType === 'mobx' ? '' : 'export default '
  }${
    isForwardRef
      ? `forwardRef${forwardRefType && options.typescript ? `<${forwardRefType}>` : ''}(`
      : ''
  }function ${json.name || 'MyComponent'}(${propsArgs}${
    isForwardRef ? `, ${options.forwardRef}` : ''
  }) {
    ${
      options.contextType === 'prop-drill'
        ? `const ${contextPropDrillingKey} = { ...props['${contextPropDrillingKey}'] };`
        : ''
    }
    ${hasStateArgument ? '' : refsString}
      ${
        hasState
          ? stateType === 'mobx'
            ? `const state = useLocalObservable(() => (${getStateObjectStringFromComponent(
                json,
              )}));`
            : stateType === 'useState'
            ? useStateCode
            : stateType === 'solid'
            ? `const state = useMutable(${getStateObjectStringFromComponent(json)});`
            : stateType === 'builder'
            ? `const state = useBuilderState(${getStateObjectStringFromComponent(json)});`
            : stateType === 'variables'
            ? `const state = ${getStateObjectStringFromComponent(json)};`
            : `const state = useLocalProxy(${getStateObjectStringFromComponent(json)});`
          : ''
      }
      ${hasStateArgument ? refsString : ''}
      ${getContextString(json, options)}
      ${getInitCode(json, options)}
      ${contextStr || ''}

      ${
        json.hooks.onInit?.code
          ? `
          useEffect(() => {
            ${processHookCode({
              str: json.hooks.onInit.code,
              options,
            })}
          }, [])
          `
          : ''
      }
      ${
        json.hooks.onMount?.code
          ? `useEffect(() => {
            ${processHookCode({
              str: json.hooks.onMount.code,
              options,
            })}
          }, [])`
          : ''
      }

      ${
        json.hooks.onUpdate
          ?.map(
            (hook) => `useEffect(() => {
            ${processHookCode({ str: hook.code, options })}
          },
          ${hook.deps ? processHookCode({ str: hook.deps, options }) : ''})`,
          )
          .join(';') ?? ''
      }

      ${
        json.hooks.onUnMount?.code
          ? `useEffect(() => {
            return () => {
              ${processHookCode({
                str: json.hooks.onUnMount.code,
                options,
              })}
            }
          }, [])`
          : ''
      }

      return (
        ${wrap ? openFrag(options) : ''}
        ${json.children.map((item) => blockToReact(item, options, json, [])).join('\n')}
        ${
          componentHasStyles && stylesType === 'styled-jsx'
            ? `<style jsx>{\`${css}\`}</style>`
            : componentHasStyles && stylesType === 'style-tag'
            ? `<style>{\`${css}\`}</style>`
            : ''
        }
        ${wrap ? closeFrag(options) : ''}
      );
    }${isForwardRef ? ')' : ''}

    ${getPropsDefinition({ json })}

    ${
      !nativeStyles
        ? ''
        : `
      const styles = StyleSheet.create(${json5.stringify(nativeStyles)});
    `
    }

    ${styledComponentsCode ? styledComponentsCode : ''}
    ${
      stateType === 'mobx'
        ? `
      const observed${json.name || 'MyComponent'} = observer(${json.name || 'MyComponent'});
      export default observed${json.name || 'MyComponent'};
    `
        : ''
    }

  `;

  str = stripNewlinesInStrings(str);

  return str;
};
