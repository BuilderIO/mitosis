import { types } from '@babel/core';
import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { BaseTranspilerOptions, Transpiler } from '../types/config';
import traverse from 'traverse';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { babelTransformExpression } from '../helpers/babel-transform';
import { capitalize } from '../helpers/capitalize';
import {
  collectCss,
  collectStyledComponents,
  hasStyles,
} from '../helpers/collect-styles';
import { createMitosisNode } from '../helpers/create-mitosis-node';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { getRefs } from '../helpers/get-refs';
import {
  getMemberObjectString,
  getStateObjectStringFromComponent,
} from '../helpers/get-state-object-string';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { handleMissingState } from '../helpers/handle-missing-state';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { isValidAttributeName } from '../helpers/is-valid-attribute-name';
import { mapRefs } from '../helpers/map-refs';
import { processHttpRequests } from '../helpers/process-http-requests';
import { processTagReferences } from '../helpers/process-tag-references';
import { renderPreComponent } from '../helpers/render-imports';
import { stripNewlinesInStrings } from '../helpers/replace-new-lines-in-strings';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import {
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { selfClosingTags } from '../parsers/jsx';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import { hasContext } from './helpers/context';
import { collectReactNativeStyles } from './react-native';

export interface ToReactOptions extends BaseTranspilerOptions {
  stylesType?: 'emotion' | 'styled-components' | 'styled-jsx' | 'react-native';
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
  format?: 'lite' | 'safe';
  type?: 'dom' | 'native';
}

const wrapInFragment = (json: MitosisComponent | MitosisNode) =>
  json.children.length !== 1;

const NODE_MAPPERS: {
  [key: string]: (json: MitosisNode, options: ToReactOptions) => string;
} = {
  Fragment(json, options) {
    const wrap = wrapInFragment(json);
    return `${wrap ? '<>' : ''}${json.children
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}`;
  },
  For(json, options) {
    const wrap = wrapInFragment(json);
    return `{${processBinding(json.bindings.each as string, options)}?.map((${
      json.properties._forName
    }, index) => (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    ))}`;
  },
  Show(json, options) {
    const wrap = wrapInFragment(json);
    return `{${processBinding(json.bindings.when as string, options)} ? (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    ) : ${
      !json.meta.else ? 'null' : blockToReact(json.meta.else as any, options)
    }}`;
  },
};

// TODO: Maybe in the future allow defining `string | function` as values
const BINDING_MAPPERS: {
  [key: string]: string | ((key: string, value: string) => [string, string]);
} = {
  innerHTML(_key, value) {
    return [
      'dangerouslySetInnerHTML',
      JSON.stringify({ __html: value.replace(/\s+/g, ' ') }),
    ];
  },
};

export const blockToReact = (json: MitosisNode, options: ToReactOptions) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options);
  }

  if (json.properties._text) {
    const text = json.properties._text;
    if (options.type === 'native' && text.trim().length) {
      return `<Text>${text}</Text>`;
    }
    return text;
  }
  if (json.bindings._text) {
    const processed = processBinding(json.bindings._text as string, options);
    if (options.type === 'native') {
      return `<Text>{${processed}}</Text>`;
    }
    return `{${processed}}`;
  }

  let str = '';

  str += `<${json.name} `;

  if (json.bindings._spread) {
    str += ` {...(${processBinding(
      json.bindings._spread as string,
      options,
    )})} `;
  }

  for (const key in json.properties) {
    const value = (json.properties[key] || '')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '\\n');

    if (key === 'class') {
      str += ` className="${value}" `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, value);
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
    const value = String(json.bindings[key]);
    if (key === '_spread') {
      continue;
    }
    if (key === 'css' && value.trim() === '{}') {
      continue;
    }

    const useBindingValue = processBinding(value, options);
    if (key.startsWith('on')) {
      str += ` ${key}={event => ${updateStateSettersInCode(
        useBindingValue,
        options,
      )} } `;
    } else if (key === 'class') {
      str += ` className={${useBindingValue}} `;
    } else if (BINDING_MAPPERS[key]) {
      const mapper = BINDING_MAPPERS[key];
      if (typeof mapper === 'function') {
        const [newKey, newValue] = mapper(key, useBindingValue);
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

  str += '>';

  if (json.children) {
    str += json.children.map((item) => blockToReact(item, options)).join('\n');
  }

  return str + `</${json.name}>`;
};

const getRefsString = (json: MitosisComponent, refs = getRefs(json)) => {
  let str = '';

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
};

/**
 * Removes all `this.` references.
 */
const stripThisRefs = (str: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return str.replace(/this\.([a-zA-Z_\$0-9]+)/g, '$1');
};

const processBinding = (str: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });
};

const getUseStateCode = (json: MitosisComponent, options: ToReactOptions) => {
  let str = '';

  const { state } = json;

  const valueMapper = (val: string) => {
    const x = processBinding(updateStateSettersInCode(val, options), options);
    return stripThisRefs(x, options);
  };

  const lineItemDelimiter = '\n\n\n';

  for (const key in state) {
    const value = state[key];

    const defaultCase = `const [${key}, set${capitalize(
      key,
    )}] = useState(() => (${valueMapper(json5.stringify(value))}))`;

    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        const useValue = value.replace(functionLiteralPrefix, '');
        const mappedVal = valueMapper(useValue);

        str += mappedVal;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const useValue = methodValue.replace(/^(get )?/, 'function ');
        str += valueMapper(useValue);
      } else {
        str += defaultCase;
      }
    } else {
      str += defaultCase;
    }

    str += lineItemDelimiter;
  }

  return str;
};

const updateStateSetters = (
  json: MitosisComponent,
  options: ToReactOptions,
) => {
  if (options.stateType !== 'useState') {
    return;
  }
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key] as string;
        const newValue = updateStateSettersInCode(value, options);
        if (newValue !== value) {
          item.bindings[key] = newValue;
        }
      }
    }
  });
};

function addProviderComponents(
  json: MitosisComponent,
  options: ToReactOptions,
) {
  for (const key in json.context.set) {
    const { name, value } = json.context.set[key];
    json.children = [
      createMitosisNode({
        name: `${name}.Provider`,
        children: json.children,
        ...(value && {
          bindings: {
            value: getMemberObjectString(value),
          },
        }),
      }),
    ];
  }
}

const updateStateSettersInCode = (value: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return value;
  }
  return babelTransformExpression(value, {
    AssignmentExpression(
      path: babel.NodePath<babel.types.AssignmentExpression>,
    ) {
      const { node } = path;
      if (types.isMemberExpression(node.left)) {
        if (types.isIdentifier(node.left.object)) {
          // TODO: utillity to properly trace this reference to the beginning
          if (node.left.object.name === 'state') {
            // TODO: ultimately support other property access like strings
            const propertyName = (node.left.property as types.Identifier).name;
            path.replaceWith(
              types.callExpression(
                types.identifier(`set${capitalize(propertyName)}`),
                [node.right],
              ),
            );
          }
        }
      }
    },
  });
};

function getContextString(
  component: MitosisComponent,
  options: ToReactOptions,
) {
  let str = '';
  for (const key in component.context.get) {
    str += `
      const ${key} = useContext(${component.context.get[key].name});
    `;
  }

  return str;
}

const getInitCode = (
  json: MitosisComponent,
  options: ToReactOptions,
): string => {
  return processBinding(json.hooks.init?.code || '', options);
};

type ReactExports =
  | 'useState'
  | 'useRef'
  | 'useCallback'
  | 'useEffect'
  | 'useContext';

const DEFAULT_OPTIONS: ToReactOptions = {
  stateType: 'useState',
  stylesType: 'styled-jsx',
};

export const componentToReact =
  (reactOptions: ToReactOptions = {}): Transpiler =>
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
      json.subComponents
        .map((item) => _componentToReact(item, options, true))
        .join('\n\n\n');

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
        console.error(
          'Format error for file:',
          str,
          JSON.stringify(json, null, 2),
        );
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
  const componentHasStyles = hasStyles(json);
  if (options.stateType === 'useState') {
    gettersToFunctions(json);
    updateStateSetters(json, options);
  }

  const refs = getRefs(json);
  let hasState = Boolean(Object.keys(json.state).length);

  mapRefs(json, (refName) => `${refName}.current`);

  const stylesType = options.stylesType || 'emotion';
  const stateType = options.stateType || 'mobx';
  if (stateType === 'builder') {
    // Always use state if we are generate Builder react code
    hasState = true;
  }

  const useStateCode =
    stateType === 'useState' && getUseStateCode(json, options);
  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }

  const css =
    stylesType === 'styled-jsx' && collectCss(json, { classProperty: 'class' });

  const styledComponentsCode =
    stylesType === 'styled-components' &&
    componentHasStyles &&
    collectStyledComponents(json);

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
  if (refs.size) {
    reactLibImports.add('useRef');
  }
  if (
    json.hooks.onMount?.code ||
    json.hooks.onUnMount?.code ||
    json.hooks.onUpdate?.length
  ) {
    reactLibImports.add('useEffect');
  }

  const wrap =
    wrapInFragment(json) || (componentHasStyles && stylesType === 'styled-jsx');

  const nativeStyles =
    stylesType === 'react-native' &&
    componentHasStyles &&
    collectReactNativeStyles(json);

  let str = dedent`
  ${
    options.type !== 'native'
      ? ''
      : `
  import * as React from 'react';
  import { View, StyleSheet, Image, Text } from 'react-native';
  `
  }
  ${styledComponentsCode ? `import styled from 'styled-components';\n` : ''}
  ${
    reactLibImports.size
      ? `import { ${Array.from(reactLibImports).join(', ')} } from 'react'`
      : ''
  }
  ${
    componentHasStyles && stylesType === 'emotion' && options.format !== 'lite'
      ? `/** @jsx jsx */
    import { jsx } from '@emotion/react'`.trim()
      : ''
  }
    ${
      hasState && stateType === 'valtio'
        ? `import { useLocalProxy } from 'valtio/utils';`
        : ''
    }
    ${
      hasState && stateType === 'solid'
        ? `import { useMutable } from 'react-solid-state';`
        : ''
    }
    ${
      stateType === 'mobx' && hasState
        ? `import { useLocalObservable } from 'mobx-react-lite';`
        : ''
    }
    ${renderPreComponent(json)}

    ${isSubComponent ? '' : 'export default '}function ${
    json.name || 'MyComponent'
  }(props) {
      ${
        hasState
          ? stateType === 'mobx'
            ? `const state = useLocalObservable(() => (${getStateObjectStringFromComponent(
                json,
              )}));`
            : stateType === 'useState'
            ? useStateCode
            : stateType === 'solid'
            ? `const state = useMutable(${getStateObjectStringFromComponent(
                json,
              )});`
            : stateType === 'builder'
            ? `var state = useBuilderState(${getStateObjectStringFromComponent(
                json,
              )});`
            : `const state = useLocalProxy(${getStateObjectStringFromComponent(
                json,
              )});`
          : ''
      }
      ${getContextString(json, options)}
      ${getRefsString(json)}
      ${getInitCode(json, options)}

      ${
        json.hooks.onMount?.code
          ? `useEffect(() => {
            ${processBinding(
              updateStateSettersInCode(json.hooks.onMount.code, options),
              options,
            )}
          }, [])`
          : ''
      }

      ${
        json.hooks.onUpdate?.length
          ? json.hooks.onUpdate
              .map(
                (hook) => `useEffect(() => {
            ${processBinding(
              updateStateSettersInCode(hook.code, options),
              options,
            )}
          }, 
          ${
            hook.deps
              ? processBinding(
                  updateStateSettersInCode(hook.deps, options),
                  options,
                )
              : ''
          })`,
              )
              .join(';')
          : ''
      }

      ${
        json.hooks.onUnMount?.code
          ? `useEffect(() => {
            return () => {
              ${processBinding(
                updateStateSettersInCode(json.hooks.onUnMount.code, options),
                options,
              )}
            }
          }, [])`
          : ''
      }

      return (
        ${wrap ? '<>' : ''}
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
        ${
          componentHasStyles && stylesType === 'styled-jsx'
            ? `<style jsx>{\`${css}\`}</style>`
            : ''
        }
        ${wrap ? '</>' : ''}
      );
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
