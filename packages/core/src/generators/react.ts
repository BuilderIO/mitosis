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
import { startCase } from 'lodash';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { babelTransformCode } from '../helpers/babel-transform';
import { types } from '@babel/core';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';

type ToReactOptions = {
  prettier?: boolean;
  stylesType?: 'emotion' | 'styled-components' | 'styled-jsx';
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid';
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToReactOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<>${json.children
      .map((item) => blockToReact(item, options))
      .join('\n')}</>`;
  },
};

const blockToReact = (json: JSXLiteNode, options: ToReactOptions) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (json.properties._text) {
    return json.properties._text;
  }
  if (json.bindings._text) {
    return `{${processBinding(json.bindings._text as string, options)}}`;
  }

  let str = '';

  const children = json.children.filter(filterEmptyTextNodes);

  if (json.name === 'For') {
    str += `{${processBinding(json.bindings.each as string, options)}.map(${
      json.bindings._forName
    } => (
      ${children.length === 1 ? '' : '<>'}
        ${children.map((item) => blockToReact(item, options)).join('\n')}
      ${children.length === 1 ? '' : '</>'}
    ))}`;
  } else if (json.name === 'Show') {
    str += `{Boolean(${processBinding(
      json.bindings.when as string,
      options,
    )}) && (
      ${children.length === 1 ? '' : '<>'}
        ${children.map((item) => blockToReact(item, options)).join('\n')}
      ${children.length === 1 ? '' : '</>'}
    )}`;
  } else {
    str += `<${json.name} `;

    if (json.bindings._spread) {
      str += ` {...(${processBinding(
        json.bindings._spread as string,
        options,
      )})} `;
    }

    for (const key in json.properties) {
      const value = json.properties[key];
      str += ` ${key}="${(value as string).replace(/"/g, '&quot;')}" `;
    }
    for (const key in json.bindings) {
      const value = json.bindings[key] as string;
      if (key === '_spread') {
        continue;
      }

      if (key.startsWith('on')) {
        str += ` ${key}={event => (${processBinding(value, options)})} `;
      } else {
        str += ` ${key}={${processBinding(value, options)}} `;
      }
    }
    if (selfClosingTags.has(json.name)) {
      return str + ' />';
    }
    str += '>';
    if (json.children) {
      str += json.children
        .map((item) => blockToReact(item, options))
        .join('\n');
    }

    str += `</${json.name}>`;
  }

  return str;
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

  const valueMapper = (val: string) => processBinding(val, options);

  const keyValueDelimiter = '=';
  const lineItemDelimiter = '\n';

  for (const key in state) {
    const value = state[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        const functionValue = value.replace(functionLiteralPrefix, '');
        str += `const [${key}, set${startCase(
          key,
        )}] ${keyValueDelimiter} useState(() => (${valueMapper(
          functionValue,
        )}))${lineItemDelimiter} `;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const useValue = methodValue.replace(/^(get )?/, 'function ');
        str += `${valueMapper(useValue)} ${lineItemDelimiter}`;
      } else {
        str += `const [${key}, set${startCase(
          key,
        )}] ${keyValueDelimiter} useState(() => (${valueMapper(
          json5.stringify(value),
        )}))${lineItemDelimiter} `;
      }
    } else {
      str += `const [${key}, set${startCase(
        key,
      )}] ${keyValueDelimiter} useState(() => (${valueMapper(
        json5.stringify(value),
      )}))${lineItemDelimiter} `;
    }
  }

  return str;
};

const updateStateSetters = (json: JSXLiteComponent) => {
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key] as string;
        let matchFound = false;
        const newValue = babelTransformCode(value, {
          AssignmentExpression(
            path: babel.NodePath<babel.types.AssignmentExpression>,
          ) {
            const { node } = path;
            if (types.isMemberExpression(node.left)) {
              if (types.isIdentifier(node.left.object)) {
                // TODO: utillity to properly trace this reference to the beginning
                if (node.left.object.name === 'state') {
                  // TODO: ultimately support other property access like strings
                  const propertyName = (node.left.property as types.Identifier)
                    .name;
                  matchFound = true;
                  path.replaceWith(
                    types.callExpression(
                      types.identifier(`set${startCase(propertyName)}`),
                      [node.right],
                    ),
                  );
                }
              }
            }
          },
        });
        if (matchFound) {
          item.bindings[key] = newValue;
        }
      }
    }
  });
};

/**
 * Map getters like `useState({ get foo() { ... }})` from `state.foo` to `foo()`
 */
const updateGetterRefs = (json: JSXLiteComponent) => {
  const getterKeys = Object.keys(json.state).filter((item) => {
    const value = json.state[item];
    if (
      typeof value === 'string' &&
      value.startsWith(methodLiteralPrefix) &&
      value.replace(methodLiteralPrefix, '').startsWith('get ')
    ) {
      return true;
    }
    return false;
  });
  console.log('getterKeys', getterKeys);
  traverse(json).forEach(function (item) {
    // TODO: not all strings are expressions!
    if (typeof item === 'string') {
      let value = item;
      for (const key of getterKeys) {
        try {
          this.update(
            value.replace(
              new RegExp(`state\\s*\\.\\s*${key}([^a-z0-9]|$)`, 'i'),
              `${key}()$1`,
            ),
          );
        } catch (err) {
          console.error('Could not update getter ref', err);
        }
      }
    }
  });
};

export const componentToReact = (
  componentJson: JSXLiteComponent,
  options: ToReactOptions = {},
) => {
  const json = fastClone(componentJson);
  const componentHasStyles = hasStyles(json);
  if (options.stateType === 'useState') {
    updateGetterRefs(json);
    updateStateSetters(json);
  }

  const hasRefs = Boolean(getRefs(componentJson).size);
  const hasState = Boolean(Object.keys(json.state).length);
  mapRefs(json, (refName) => `${refName}.current`);

  const stylesType = options.stylesType || 'emotion';
  const stateType = options.stateType || 'mobx';

  const useStateCode =
    stateType === 'useState' && getUseStateCode(json, options);

  const css =
    stylesType === 'styled-jsx' &&
    collectCss(json, { classProperty: 'className' });

  const styledComponentsCode =
    stylesType === 'styled-components' &&
    componentHasStyles &&
    collectStyledComponents(json);

  const needsWrapperFragment =
    json.children.length > 1 ||
    (componentHasStyles && stylesType === 'styled-jsx');

  let str = dedent`
  ${
    useStateCode && useStateCode.length > 4
      ? `import { useState } from 'react'`
      : ''
  }
  ${
    componentHasStyles && stylesType === 'emotion'
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
    ${hasRefs ? `import { useRef } from 'react';` : ''}
    ${renderPreComponent(json)}
    ${styledComponentsCode ? styledComponentsCode : ''}
    
    export default function MyComponent(props) {
      ${
        hasState
          ? stateType === 'mobx'
            ? `const state = useLocalObservable(() => (${getStateObjectString(
                json,
              )}))`
            : stateType === 'useState'
            ? useStateCode
            : stateType === 'solid'
            ? `const state = useMutable(${getStateObjectString(json)});`
            : `const state = useLocalProxy(${getStateObjectString(json)});`
          : ''
      }
      ${getRefsString(json)}

      return (
        ${needsWrapperFragment ? '<>' : ''}
        ${
          componentHasStyles && stylesType === 'styled-jsx'
            ? `<style jsx>{\`${css}\`}</style>`
            : ''
        }
        ${json.children.map((item) => blockToReact(item, options)).join('\n')}
        ${needsWrapperFragment ? '</>' : ''})
    }
   
  `;

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
  return str;
};
