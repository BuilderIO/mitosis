import { types } from '@babel/core';
import * as CSS from 'csstype';
import dedent from 'dedent';
import json5 from 'json5';
import { camelCase } from 'lodash';
import { format } from 'prettier/standalone';
import { capitalize } from '../helpers/capitalize';
import traverse from 'traverse';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { babelTransformExpression } from '../helpers/babel-transform';
import { ClassStyleMap } from '../helpers/collect-styles';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { getRefs } from '../helpers/get-refs';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { mapRefs } from '../helpers/map-refs';
import { renderPreComponent } from '../helpers/render-imports';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import {
  Plugin,
  runPostCodePlugins,
  runPostJsonPlugins,
  runPreCodePlugins,
  runPreJsonPlugins,
} from '../modules/plugins';

export const collectStyles = (json: JSXLiteComponent): ClassStyleMap => {
  const styleMap: ClassStyleMap = {};

  const componentIndexes: { [className: string]: number | undefined } = {};

  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (typeof item.bindings.css === 'string') {
        const value = json5.parse(item.bindings.css);
        delete item.bindings.css;
        const componentName = camelCase(item.name || 'view');
        const index = (componentIndexes[componentName] =
          (componentIndexes[componentName] || 0) + 1);
        const className = `${componentName}${index}`;
        item.bindings.style = `styles.${className}`;

        styleMap[className] = value;
      }
    }
  });

  return styleMap;
};

type ToReactNativeOptions = {
  prettier?: boolean;
  stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
  plugins?: Plugin[];
};

const getStyles = (json: JSXLiteNode) => {
  if (!json.bindings.css) {
    return null;
  }
  let css: CSS.Properties;
  try {
    css = json5.parse(json.bindings.css as string);
  } catch (err) {
    console.warn('Could not json 5 parse css');
    return null;
  }
  return css;
};

const scrolls = (json: JSXLiteNode) => {
  return getStyles(json)?.overflow === 'auto';
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToReactNativeOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<>${json.children
      .map((item) => blockToReactNative(item, options))
      .join('\n')}</>`;
  },
};

const blockToReactNative = (
  json: JSXLiteNode,
  options: ToReactNativeOptions,
) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (json.properties._text) {
    if (!json.properties._text.trim().length) {
      return '';
    }
    return `<Text>${json.properties._text}</Text>`;
  }
  if (json.bindings._text) {
    return `<Text>{${processBinding(
      json.bindings._text as string,
      options,
    )}}</Text>`;
  }

  let str = '';

  const children = json.children.filter(filterEmptyTextNodes);

  // TODO: do as preprocess step and do more mappings of dom attributes to special
  // Image, TextField, etc component props
  const name =
    json.name === 'input'
      ? 'TextInput'
      : json.name === 'img'
      ? 'Image'
      : json.name[0].toLowerCase() === json.name[0]
      ? json.bindings.onClick
        ? 'TouchableWithoutFeedback'
        : scrolls(json)
        ? 'ScrollView'
        : 'View'
      : json.name;

  if (json.name === 'For') {
    str += `{${processBinding(json.bindings.each as string, options)}.map(${
      json.bindings._forName
    } => (
      <>${children
        .map((item) => blockToReactNative(item, options))
        .join('\n')}</>
    ))}`;
  } else if (json.name === 'Show') {
    str += `{Boolean(${processBinding(
      json.bindings.when as string,
      options,
    )}) && (
      <>${children
        .map((item) => blockToReactNative(item, options))
        .join('\n')}</>
    )}`;
  } else {
    str += `<${name} `;

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
        .map((item) => blockToReactNative(item, options))
        .join('\n');
    }

    str += `</${name}>`;
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

const processBinding = (str: string, options: ToReactNativeOptions) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });
};

const getUseStateCode = (
  json: JSXLiteComponent,
  options: ToReactNativeOptions,
) => {
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
        str += `const [${key}, set${capitalize(
          key,
        )}] ${keyValueDelimiter} useState(() => (${valueMapper(
          functionValue,
        )}))${lineItemDelimiter} `;
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

const updateStateSetters = (json: JSXLiteComponent) => {
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key] as string;
        let matchFound = false;
        const newValue = babelTransformExpression(value, {
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
                      types.identifier(`set${capitalize(propertyName)}`),
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

const guessAtComponentsUsed = (code: string) => {
  const components: string[] = [];
  // Slightly janky, but reliable and WAY lighter weight than doing a final babel parse (tho
  // plugins may support this later)
  for (const component of [
    'View',
    'TextInput',
    'Text',
    'Image',
    'TouchableWithoutFeedback',
    'ScrollView',
  ]) {
    if (code.match(new RegExp(`<${component}\\W`))) {
      components.push(component);
    }
  }
  return components;
};

export const componentToReactNative = (
  componentJson: JSXLiteComponent,
  options: ToReactNativeOptions = {},
) => {
  let json = fastClone(componentJson);
  if (options.plugins) {
    json = runPreJsonPlugins(json, options.plugins);
  }
  if (options.stateType === 'useState') {
    gettersToFunctions(json);
    updateStateSetters(json);
  }

  const styles = collectStyles(json);
  const hasStyles = Boolean(Object.keys(styles).length);

  const hasRefs = Boolean(getRefs(componentJson).size);
  const hasState = Boolean(Object.keys(json.state).length);
  mapRefs(json, (refName) => `${refName}.current`);

  const stateType = options.stateType || 'mobx';

  if (options.plugins) {
    json = runPostJsonPlugins(json, options.plugins);
  }

  const useStateCode =
    stateType === 'useState' && getUseStateCode(json, options);

  const children = json.children
    .map((item) => blockToReactNative(item, options))
    .join('\n');

  let str = dedent`
    import { ${guessAtComponentsUsed(children).join(', ')} ${
    hasStyles ? ', StyleSheet' : ''
  } } from 'react-native';
    ${
      useStateCode && useStateCode.length > 4
        ? `import { useState } from 'react'`
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

    export default function MyComponent(props) {
      ${
        hasState
          ? stateType === 'mobx'
            ? `const state = useLocalObservable(() => (${getStateObjectString(
                json,
              )}))`
            : stateType === 'useState'
            ? useStateCode
            : stateType === 'builder'
            ? `const state = useBuilderState(${getStateObjectString(json)})`
            : stateType === 'solid'
            ? `const state = useMutable(${getStateObjectString(json)});`
            : `const state = useLocalProxy(${getStateObjectString(json)});`
          : ''
      }
      ${getRefsString(json)}

      return (
        <>
          ${children}
        </>
      );
    }

    ${
      !hasStyles
        ? ''
        : `
    
      const styles = StyleSheet.create(${json5.stringify(styles)})
    `
    }

  `;

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
