import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import {
  collectCss,
  collectStyledComponents,
  hasStyles,
} from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import traverse from 'traverse';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { babelTransformExpression } from '../helpers/babel-transform';
import { types } from '@babel/core';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';
import { capitalize } from '../helpers/capitalize';
import { stripNewlinesInStrings } from '../helpers/replace-new-lines-in-strings';
import { stripMetaProperties } from '../helpers/strip-meta-properties';
import { isValidAttributeName } from '../helpers/is-valid-attribute-name';

type ToReactOptions = {
  prettier?: boolean;
  stylesType?: 'emotion' | 'styled-components' | 'styled-jsx';
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
  format?: 'lite' | 'safe';
  plugins?: Plugin[];
};

const wrapInFragment = (json: JSXLiteComponent | JSXLiteNode) =>
  json.children.length !== 1;

const NODE_MAPPERS: {
  [key: string]: (json: JSXLiteNode, options: ToReactOptions) => string;
} = {
  Fragment(json, options) {
    const wrap = wrapInFragment(json);
    return `${wrap ? '<>' : ''}${json.children
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}`;
  },
  For(json, options) {
    const wrap = wrapInFragment(json);
    return `{${processBinding(json.bindings.each as string, options)}.map(${
      json.bindings._forName
    } => (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    ))}`;
  },
  Show(json, options) {
    const wrap = wrapInFragment(json);
    return `{${options.format === 'safe' ? 'Boolean' : ''}(${processBinding(
      json.bindings.when as string,
      options,
    )}) && (
      ${wrap ? '<>' : ''}${json.children
      .filter(filterEmptyTextNodes)
      .map((item) => blockToReact(item, options))
      .join('\n')}${wrap ? '</>' : ''}
    )}`;
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

export const blockToReact = (json: JSXLiteNode, options: ToReactOptions) => {
  if (NODE_MAPPERS[json.name]) {
    return NODE_MAPPERS[json.name](json, options);
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${processBinding(json.bindings._text as string, options)}}`;
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

const getRefsString = (json: JSXLiteComponent, refs = getRefs(json)) => {
  let str = '';

  for (const ref of Array.from(refs)) {
    str += `\nconst ${ref} = useRef();`;
  }

  return str;
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

const getUseStateCode = (json: JSXLiteComponent, options: ToReactOptions) => {
  let str = '';

  const { state } = json;

  const valueMapper = (val: string) =>
    processBinding(updateStateSettersInCode(val, options), options);

  const keyValueDelimiter = '=';
  const lineItemDelimiter = '\n\n\n';

  for (const key in state) {
    const value = state[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        const useValue = value.replace(functionLiteralPrefix, '');
        str += `${valueMapper(useValue)} ${lineItemDelimiter}`;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const useValue = methodValue.replace(/^(get )?/, 'function ');
        str += `${valueMapper(useValue)} ${lineItemDelimiter}`;
      } else {
        str += `const [${key}, set${capitalize(
          key,
        )}] ${keyValueDelimiter} useState(() => (${valueMapper(
          json5.stringify(value),
        )}))${lineItemDelimiter} `;
      }
    } else {
      str += `const [${key}, set${capitalize(
        key,
      )}] ${keyValueDelimiter} useState(() => (${valueMapper(
        json5.stringify(value),
      )}))${lineItemDelimiter} `;
    }
  }

  return str;
};

const updateStateSetters = (
  json: JSXLiteComponent,
  options: ToReactOptions,
) => {
  if (options.stateType !== 'useState') {
    return;
  }
  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
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

const getInitCode = (json: JSXLiteComponent): string => {
  if (!json.hooks.init) {
    return '';
  }
  return `
    const [firstRender, setFirstRender] = React.useState(true);
    if (firstRender) {
      setFirstRender(false);
      ${json.hooks.init}
    }
  `;
};

type ReactExports = 'useState' | 'useRef' | 'useCallback' | 'useEffect';

export const componentToReact = (
  componentJson: JSXLiteComponent,
  reactOptions: ToReactOptions = {},
) => {
  let json = fastClone(componentJson);
  const options: ToReactOptions = {
    stateType: 'useState',
    stylesType: 'styled-components',
    ...reactOptions,
  };
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }

  let str = _componentToReact(componentJson, options);

  str +=
    '\n\n\n' +
    componentJson.subComponents
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
  json: JSXLiteComponent,
  options: ToReactOptions,
  isSubComponent = false,
) => {
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
  if (useStateCode && useStateCode.length > 4) {
    reactLibImports.add('useState');
  }
  if (refs.size) {
    reactLibImports.add('useRef');
  }
  if (json.hooks.onMount || json.hooks.onUnMount) {
    reactLibImports.add('useEffect');
  }

  const wrap = wrapInFragment(json);

  let str = dedent`
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
    ${styledComponentsCode ? styledComponentsCode : ''}


    ${isSubComponent ? '' : 'export default '}function ${json.name ||
    'MyComponent'}(props) {
      ${
        hasState
          ? stateType === 'mobx'
            ? `const state = useLocalObservable(() => (${getStateObjectString(
                json,
              )}));`
            : stateType === 'useState'
            ? useStateCode
            : stateType === 'solid'
            ? `const state = useMutable(${getStateObjectString(json)});`
            : stateType === 'builder'
            ? `var state = useBuilderState(${getStateObjectString(json)});`
            : `const state = useLocalProxy(${getStateObjectString(json)});`
          : ''
      }
      ${getRefsString(json)}
      ${getInitCode(json)}

      ${
        json.hooks.onMount
          ? `useEffect(() => {
            ${processBinding(
              updateStateSettersInCode(json.hooks.onMount, options),
              options,
            )}
          }, [])`
          : ''
      }

      ${
        json.hooks.onUnMount
          ? `useEffect(() => {
            ${processBinding(
              updateStateSettersInCode(json.hooks.onUnMount, options),
              options,
            )}
          }, [])`
          : ''
      }

      return (
        ${wrap ? '<>' : ''}
        ${
          componentHasStyles && stylesType === 'styled-jsx'
            ? `<style jsx>{\`${css}\`}</style>`
            : ''
        }
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
        ${wrap ? '</>' : ''}
      );
    }

  `;

  str = stripNewlinesInStrings(str);

  return str;
};
