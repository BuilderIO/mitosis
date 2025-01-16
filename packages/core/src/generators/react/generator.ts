import { getDefaultProps } from '@/generators/react/helpers/default-props';
import {
  getOnEventHookComponentBody,
  getOnInitHookComponentBody,
  getOnMountComponentBody,
  getOnUnMountComponentBody,
  getOnUpdateComponentBody,
} from '@/generators/react/helpers/hooks';
import { createSingleBinding } from '@/helpers/bindings';
import { createMitosisNode } from '@/helpers/create-mitosis-node';
import { dedent } from '@/helpers/dedent';
import { fastClone } from '@/helpers/fast-clone';
import { getPropsRef } from '@/helpers/get-props-ref';
import { getRefs } from '@/helpers/get-refs';
import { stringifyContextValue } from '@/helpers/get-state-object-string';
import { gettersToFunctions } from '@/helpers/getters-to-functions';
import { handleMissingState } from '@/helpers/handle-missing-state';
import { isRootTextNode } from '@/helpers/is-root-text-node';
import { mapRefs } from '@/helpers/map-refs';
import { initializeOptions } from '@/helpers/merge-options';
import { checkIsDefined } from '@/helpers/nullable';
import { processOnEventHooksPlugin } from '@/helpers/on-event';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { processHttpRequests } from '@/helpers/process-http-requests';
import { renderPreComponent } from '@/helpers/render-imports';
import { replaceNodes, replaceStateIdentifier } from '@/helpers/replace-identifiers';
import { stripNewlinesInStrings } from '@/helpers/replace-new-lines-in-strings';
import { checkHasState } from '@/helpers/state';
import { stripMetaProperties } from '@/helpers/strip-meta-properties';
import { collectCss } from '@/helpers/styles/collect-css';
import { collectStyledComponents } from '@/helpers/styles/collect-styled-components';
import { hasCss } from '@/helpers/styles/helpers';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '@/modules/plugins';
import { MitosisComponent } from '@/types/mitosis-component';
import { TranspilerGenerator } from '@/types/transpiler';
import { types } from '@babel/core';
import hash from 'hash-sum';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { hasContext } from '../helpers/context';
import { checkIfIsClientComponent } from '../helpers/rsc';
import { collectReactNativeStyles } from '../react-native';
import { blockToReact } from './blocks';
import {
  closeFrag,
  isReactForwardRef,
  openFrag,
  processTagReferences,
  wrapInFragment,
} from './helpers';
import {
  getDefaultImport,
  getReactVariantStateImportString,
  getReactVariantStateString,
  getUseStateCode,
  processHookCode,
  updateStateSetters,
} from './helpers/state';
import { ToReactOptions } from './types';

export const contextPropDrillingKey = '_context';

/**
 * If the root Mitosis component only has 1 child, and it is a `Show`/`For` node, then we need to wrap it in a fragment.
 * Otherwise, we end up with invalid React render code.
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
            name: `${name}.Provider`,
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

type ReactExports =
  | 'useState'
  | 'useRef'
  | 'useCallback'
  | 'useEffect'
  | 'useContext'
  | 'forwardRef';

export const componentToPreact: TranspilerGenerator<Partial<ToReactOptions>> = (
  reactOptions = {},
) =>
  componentToReact({
    ...reactOptions,
    preact: true,
  });

export const componentToReact: TranspilerGenerator<Partial<ToReactOptions>> =
  (reactOptions = {}) =>
  ({ component, path }) => {
    let json = fastClone(component);

    const target = reactOptions.preact
      ? 'preact'
      : reactOptions.type === 'native'
      ? 'reactNative'
      : reactOptions.type === 'taro'
      ? 'taro'
      : reactOptions.rsc
      ? 'rsc'
      : 'react';

    const stateType = reactOptions.stateType || 'useState';

    const DEFAULT_OPTIONS: ToReactOptions = {
      addUseClientDirectiveIfNeeded: true,
      stateType,
      stylesType: 'styled-jsx',
      type: 'dom',
      plugins: [
        processOnEventHooksPlugin({ setBindings: false }),
        ...(stateType === 'variables'
          ? [
              CODE_PROCESSOR_PLUGIN((codeType, json) => (code, hookType) => {
                if (codeType === 'types') return code;

                code = replaceNodes({
                  code,
                  nodeMaps: Object.entries(json.state)
                    .filter(([key, value]) => value?.type === 'getter')
                    .map(([key, value]) => {
                      const expr = types.memberExpression(
                        types.identifier('state'),
                        types.identifier(key),
                      );
                      return {
                        from: expr,
                        // condition: (path) => !types.isObjectMethod(path.parent),
                        to: types.callExpression(expr, []),
                      };
                    }),
                });

                code = replaceStateIdentifier(null)(code);

                return code;
              }),
            ]
          : []),
      ],
    };

    const options = initializeOptions({
      target,
      component,
      defaults: DEFAULT_OPTIONS,
      userOptions: reactOptions,
    });

    if (options.plugins) {
      json = runPreJsonPlugins({ json, plugins: options.plugins });
    }

    let str = _componentToReact(json, options);

    str +=
      '\n\n\n' +
      json.subComponents.map((item) => _componentToReact(item, options, true)).join('\n\n\n');

    if (options.plugins) {
      str = runPreCodePlugins({ json, code: str, plugins: options.plugins });
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
        if (process.env.NODE_ENV !== 'test') {
          console.error('Format error for file:', str);
        }
        throw err;
      }
    }
    if (options.plugins) {
      str = runPostCodePlugins({ json, code: str, plugins: options.plugins });
    }
    return str;
  };

const isRSC = (json: MitosisComponent, options: ToReactOptions) => {
  // When using RSC generator, we check `componentType` field in metadata to determine if it's a server component
  const componentType = json.meta.useMetadata?.rsc?.componentType;
  if (options.rsc && checkIsDefined(componentType)) {
    return componentType === 'server';
  }

  return !checkIfIsClientComponent(json);
};
const checkShouldAddUseClientDirective = (json: MitosisComponent, options: ToReactOptions) => {
  if (!options.addUseClientDirectiveIfNeeded) return false;
  if (options.type === 'native') return false;
  if (options.preact) return false;

  return !isRSC(json, options);
};

const _componentToReact = (
  json: MitosisComponent,
  options: ToReactOptions,
  isSubComponent = false,
) => {
  processHttpRequests(json);
  handleMissingState(json);
  processTagReferences(json, options);
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

  // Always use state if we are generate Builder react code
  const hasState = options.stateType === 'builder' || checkHasState(json);

  const [forwardRef, hasPropRef] = getPropsRef(json);
  const isForwardRef = !options.preact && Boolean(isReactForwardRef(json) || hasPropRef);
  if (isForwardRef) {
    const meta = isReactForwardRef(json) as string;
    options.forwardRef = meta || forwardRef;
  }
  const forwardRefType =
    options.typescript && json.propsTypeRef && forwardRef && json.propsTypeRef !== 'any'
      ? `<${json.propsTypeRef}["${forwardRef}"]>`
      : '';

  const useStateCode = options.stateType === 'useState' ? getUseStateCode(json, options) : '';
  if (options.plugins) {
    json = runPostJsonPlugins({ json, plugins: options.plugins });
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

  const reactLibImports: Set<ReactExports> = new Set();
  if (useStateCode.includes('useState')) {
    reactLibImports.add('useState');
  }
  if (hasContext(json) && options.contextType !== 'prop-drill') {
    reactLibImports.add('useContext');
  }

  const shouldAddUseClientDirective = checkShouldAddUseClientDirective(json, options);

  const shouldInlineOnInitHook =
    !shouldAddUseClientDirective && options.rsc && isRSC(json, options);

  if (allRefs.length || (json.hooks.onInit?.code && !shouldInlineOnInitHook)) {
    reactLibImports.add('useRef');
  }
  if (!options.preact && hasPropRef) {
    reactLibImports.add('forwardRef');
  }
  if (json.hooks.onMount.length || json.hooks.onUnMount?.code || json.hooks.onUpdate?.length) {
    reactLibImports.add('useEffect');
  }

  const hasCustomStyles = !!json.style?.length;
  const shouldInjectCustomStyles =
    hasCustomStyles &&
    (options.stylesType === 'styled-components' || options.stylesType === 'emotion');

  const wrap =
    wrapInFragment(json) ||
    isRootTextNode(json) ||
    (componentHasStyles &&
      (options.stylesType === 'styled-jsx' || options.stylesType === 'style-tag')) ||
    shouldInjectCustomStyles ||
    isRootSpecialNode(json);

  const [hasStateArgument, refsString] = getRefsString(json, allRefs, options);

  // NOTE: `collectReactNativeStyles` must run before style generation in the component generation body, as it has
  // side effects that delete styles bindings from the JSON.
  const reactNativeStyles =
    options.stylesType === 'react-native' && componentHasStyles
      ? collectReactNativeStyles(json, options)
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
    ${getReactVariantStateString({ hasState, useStateCode, json, options })}
    ${hasStateArgument ? refsString : ''}
    ${getContextString(json, options)}
    ${json.hooks.init?.code ? processHookCode({ str: json.hooks.init?.code, options }) : ''}
    ${contextStr || ''}

    ${getOnInitHookComponentBody({ shouldInlineOnInitHook, json, options })}
    ${getOnEventHookComponentBody(json)}
    ${getOnMountComponentBody({ json, options })}
    ${getOnUpdateComponentBody({ json, options })}
    ${getOnUnMountComponentBody({ json, options })}

    return (
      ${wrap ? openFrag(options) : ''}
      ${json.children.map((item) => blockToReact(item, options, json, wrap, [])).join('\n')}
      ${
        componentHasStyles && options.stylesType === 'styled-jsx'
          ? `<style jsx>{\`${css}\`}</style>`
          : ''
      }
      ${
        componentHasStyles && options.stylesType === 'style-tag'
          ? `<style>{\`${css}\`}</style>`
          : ''
      }
      ${shouldInjectCustomStyles ? `<style>{\`${json.style}\`}</style>` : ''}
      ${wrap ? closeFrag(options) : ''}
    );
  `;

  const str = dedent`
  ${shouldAddUseClientDirective ? `'use client';` : ''}
  ${getDefaultImport(options)}
  ${styledComponentsCode ? `import styled from 'styled-components';\n` : ''}
  ${
    reactLibImports.size
      ? `import { ${Array.from(reactLibImports).join(', ')} } from '${
          options.preact ? 'preact/hooks' : 'react'
        }'`
      : ''
  }
  ${options.stylesType === 'twrnc' ? `import tw from 'twrnc';\n` : ''}
  ${
    componentHasStyles && options.stylesType === 'emotion' && options.format !== 'lite'
      ? `/** @jsx jsx */
    import { jsx } from '@emotion/react'`.trim()
      : ''
  }
    ${getReactVariantStateImportString(hasState, options)}
    ${json.types && options.typescript ? json.types.join('\n') : ''}
    ${renderPreComponent({
      explicitImportFileExtension: options.explicitImportFileExtension,
      component: json,
      target: options.type === 'native' ? 'reactNative' : 'react',
    })}
    ${isForwardRef ? `const ${json.name} = forwardRef${forwardRefType}(` : ''}function ${
    json.name
  }(${componentArgs}) {
  ${getDefaultProps(json)}
    ${componentBody}
  }${isForwardRef ? ')' : ''}

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
