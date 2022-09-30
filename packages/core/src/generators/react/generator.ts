import dedent from 'dedent';
import json5 from 'json5';
import { camelCase } from 'lodash';
import { format } from 'prettier/standalone';
import { TranspilerGenerator } from '../../types/transpiler';
import { collectCss } from '../../helpers/styles/collect-css';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { fastClone } from '../../helpers/fast-clone';
import { filterEmptyTextNodes } from '../../helpers/filter-empty-text-nodes';
import { getRefs } from '../../helpers/get-refs';
import { getPropsRef } from '../../helpers/get-props-ref';
import {
  stringifyContextValue,
  getStateObjectStringFromComponent,
} from '../../helpers/get-state-object-string';
import { gettersToFunctions } from '../../helpers/getters-to-functions';
import { handleMissingState } from '../../helpers/handle-missing-state';
import { isValidAttributeName } from '../../helpers/is-valid-attribute-name';
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
import { selfClosingTags } from '../../parsers/jsx';
import { MitosisComponent } from '../../types/mitosis-component';
import { ForNode, MitosisNode } from '../../types/mitosis-node';
import { hasContext } from '../helpers/context';
import { collectReactNativeStyles } from '../react-native';
import { collectStyledComponents } from '../../helpers/styles/collect-styled-components';
import { hasCss } from '../../helpers/styles/helpers';
import { checkHasState } from '../../helpers/state';
import { ToReactOptions } from './types';
import {
  getUseStateCode,
  processHookCode,
  updateStateSetters,
  updateStateSettersInCode,
} from './state';
import { processBinding } from './helpers';
import hash from 'hash-sum';
import { getForArguments } from '../../helpers/nodes/for';

const openFrag = (options: ToReactOptions) => getFragment('open', options);
const closeFrag = (options: ToReactOptions) => getFragment('close', options);
function getFragment(type: 'open' | 'close', options: ToReactOptions) {
  const tagName = options.preact ? 'Fragment' : '';
  return type === 'open' ? `<${tagName}>` : `</${tagName}>`;
}

/**
 * If the root Mitosis component only has 1 child, and it is a `Show`/`For` node, then we need to wrap it in a fragment.
 * Otherwise, we end up with invalid React render code.
 *
 */
const isRootSpecialNode = (json: MitosisComponent) =>
  json.children.length === 1 && ['Show', 'For'].includes(json.children[0].name);

const wrapInFragment = (json: MitosisComponent | MitosisNode) => json.children.length !== 1;

const NODE_MAPPERS: {
  [key: string]: (json: MitosisNode, options: ToReactOptions, parentSlots?: any[]) => string;
} = {
  Slot(json, options, parentSlots) {
    if (!json.bindings.name) {
      // TODO: update MitosisNode for simple code
      const key = Object.keys(json.bindings).find(Boolean);
      if (key && parentSlots) {
        const propKey = camelCase('Slot' + key[0].toUpperCase() + key.substring(1));
        parentSlots.push({ key: propKey, value: json.bindings[key]?.code });
        return '';
      }
      return `{${processBinding('props.children', options)}}`;
    }
    const slotProp = processBinding(json.bindings.name.code as string, options).replace(
      'name=',
      '',
    );
    return `{${slotProp}}`;
  },
  Fragment(json, options) {
    const wrap = wrapInFragment(json);
    return `${wrap ? getFragment('open', options) : ''}${json.children
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? getFragment('close', options) : ''}`;
  },
  For(_json, options) {
    const json = _json as ForNode;
    const wrap = wrapInFragment(json);
    const forArguments = getForArguments(json).join(', ');
    return `{${processBinding(
      json.bindings.each?.code as string,
      options,
    )}?.map((${forArguments}) => (
      ${wrap ? openFrag(options) : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? closeFrag(options) : ''}
    ))}`;
  },
  Show(json, options) {
    const wrap = wrapInFragment(json);
    return `{${processBinding(json.bindings.when?.code as string, options)} ? (
      ${wrap ? openFrag(options) : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? closeFrag(options) : ''}
    ) : ${!json.meta.else ? 'null' : blockToReact(json.meta.else as any, options)}}`;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: {
  [key: string]:
    | string
    | ((key: string, value: string, options?: ToReactOptions) => [string, string]);
} = {
  ref(ref, value, options) {
    const regexp = /(.+)?props\.(.+)( |\)|;|\()?$/m;
    if (regexp.test(value)) {
      const match = regexp.exec(value);
      const prop = match?.[2];
      if (prop) {
        return [ref, prop];
      }
    }
    return [ref, value];
  },
  innerHTML(_key, value) {
    return ['dangerouslySetInnerHTML', `{__html: ${value.replace(/\s+/g, ' ')}}`];
  },
};

export const blockToReact = (json: MitosisNode, options: ToReactOptions, parentSlots?: any[]) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options, parentSlots);
  }

  if (json.properties._text) {
    const text = json.properties._text;
    if (options.type === 'native' && text.trim().length) {
      return `<Text>${text}</Text>`;
    }
    return text;
  }
  if (json.bindings._text?.code) {
    const processed = processBinding(json.bindings._text.code as string, options);
    if (options.type === 'native') {
      return `<Text>{${processed}}</Text>`;
    }
    return `{${processed}}`;
  }

  let str = '';

  str += `<${json.name} `;

  if (json.bindings._spread?.code) {
    str += ` {...(${processBinding(json.bindings._spread.code as string, options)})} `;
  }

  for (const key in json.properties) {
    const value = (json.properties[key] || '').replace(/"/g, '&quot;').replace(/\n/g, '\\n');

    if (key === 'class') {
      str += ` className="${value}" `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, value, options);
        str += ` ${newKey}={${newValue}} `;
      } else {
        str += ` ${BINDING_MAPPERS[key]}="${value}" `;
      }
    } else {
      if (isValidAttributeName(key)) {
        str += ` ${key}="${(value as string).replace(/"/g, '&quot;')}" `;
      }
    }
  }

  for (const key in json.bindings) {
    const value = String(json.bindings[key]?.code);
    if (key === '_spread') {
      continue;
    }
    if (key === 'css' && value.trim() === '{}') {
      continue;
    }

    const useBindingValue = processBinding(value, options);
    if (key.startsWith('on')) {
      const { arguments: cusArgs = ['event'] } = json.bindings[key]!;
      str += ` ${key}={(${cusArgs.join(',')}) => ${updateStateSettersInCode(
        useBindingValue,
        options,
      )} } `;
    } else if (key.startsWith('slot')) {
      // <Component slotProjected={<AnotherComponent />} />
      str += ` ${key}={${value}} `;
    } else if (key === 'class') {
      str += ` className={${useBindingValue}} `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, useBindingValue, options);
        str += ` ${newKey}={${newValue}} `;
      } else {
        str += ` ${BINDING_MAPPERS[key]}={${useBindingValue}} `;
      }
    } else {
      if (isValidAttributeName(key)) {
        str += ` ${key}={${useBindingValue}} `;
      }
    }
  }

  if (selfClosingTags.has(json.name)) {
    return str + ' />';
  }

  // Self close by default if no children
  if (!json.children.length) {
    str += ' />';
    return str;
  }

  // TODO: update MitosisNode for simple code
  const needsToRenderSlots: any[] = [];
  let childrenNodes = '';
  if (json.children) {
    childrenNodes = json.children
      .map((item) => blockToReact(item, options, needsToRenderSlots))
      .join('\n');
  }
  if (needsToRenderSlots.length) {
    needsToRenderSlots.forEach(({ key, value }) => {
      str += ` ${key}={${value}} `;
    });
  }
  str += '>';

  if (json.children) {
    str += childrenNodes;
  }

  return str + `</${json.name}>`;
};

const getRefsString = (json: MitosisComponent, refs: string[], options: ToReactOptions) => {
  let hasStateArgument = false;
  let code = '';
  const domRefs = getRefs(json);

  for (const ref of refs) {
    const typeParameter = json['refs'][ref]?.typeParameter || '';
    // domRefs must have null argument
    const argument = json['refs'][ref]?.argument || (domRefs.has(ref) ? 'null' : '');
    hasStateArgument = /state\./.test(argument);
    code += `\nconst ${ref} = useRef${typeParameter ? `<${typeParameter}>` : ''}(${processHookCode({
      str: argument,
      options,
    })});`;
  }

  return [hasStateArgument, code];
};

function addProviderComponents(json: MitosisComponent, options: ToReactOptions) {
  for (const key in json.context.set) {
    const { name, ref, value } = json.context.set[key];
    if (value) {
      json.children = [
        createMitosisNode({
          name: `${name}.Provider`,
          children: json.children,
          ...(value && {
            bindings: {
              value: {
                code: stringifyContextValue(value),
              },
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
              value: {
                code: ref,
              },
            },
          }),
        }),
      ];
    }
  }
}

function getContextString(component: MitosisComponent, options: ToReactOptions) {
  let str = '';
  for (const key in component.context.get) {
    str += `
      const ${key} = useContext(${component.context.get[key].name});
    `;
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
  addProviderComponents(json, options);
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
  if (hasContext(json)) {
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

  const propsArgs = `props: ${json.propsTypeRef || 'any'}`;

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
  import { View, StyleSheet, Image, Text } from 'react-native';
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
        ? `import { useLocalObservable } from 'mobx-react-lite';`
        : ''
    }
    ${json.types ? json.types.join('\n') : ''}
    ${renderPreComponent({
      component: json,
      target: options.type === 'native' ? 'reactNative' : 'react',
    })}
    ${isSubComponent ? '' : 'export default '}${
    isForwardRef ? `forwardRef${forwardRefType ? `<${forwardRefType}>` : ''}(` : ''
  }function ${json.name || 'MyComponent'}(${propsArgs}${
    isForwardRef ? `, ${options.forwardRef}` : ''
  }) {
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
            ? `var state = useBuilderState(${getStateObjectStringFromComponent(json)});`
            : `const state = useLocalProxy(${getStateObjectStringFromComponent(json)});`
          : ''
      }
      ${hasStateArgument ? refsString : ''}
      ${getContextString(json, options)}
      ${getInitCode(json, options)}

      ${
        json.hooks.onInit?.code
          ? `
          useEffect(() => {
            ${processHookCode({
              str: json.hooks.onInit.code,
              options,
            })}
          })
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
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
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

    ${
      !json.defaultProps
        ? ''
        : `${json.name || 'MyComponent'}.defaultProps = ${json5.stringify(json.defaultProps)};`
    }

    ${
      !nativeStyles
        ? ''
        : `
      const styles = StyleSheet.create(${json5.stringify(nativeStyles)});
    `
    }

    ${styledComponentsCode ? styledComponentsCode : ''}
  `;

  str = stripNewlinesInStrings(str);

  return str;
};
