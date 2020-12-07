import { types } from '@babel/core';
import * as CSS from 'csstype';
import dedent from 'dedent';
import json5 from 'json5';
import { startCase, trim } from 'lodash';
import { format } from 'prettier/standalone';
import traverse from 'traverse';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { babelTransformCode } from '../helpers/babel-transform';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { getRefs } from '../helpers/get-refs';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { selfClosingTags } from '../parsers/jsx';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToSwiftOptions = {
  prettier?: boolean;
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
  [key: string]: (json: JSXLiteNode, options: ToSwiftOptions) => string;
} = {
  Fragment: (json, options) => {
    return `<>${json.children
      .map((item) => blockToSwift(item, options))
      .join('\n')}</>`;
  },
};

const blockToSwift = (json: JSXLiteNode, options: ToSwiftOptions) => {
  if (mappers[json.name]) {
    return mappers[json.name](json, options);
  }

  if (json.properties._text) {
    if (!json.properties._text.trim().length) {
      return '';
    }
    return `<Text _o="${json.properties._text}" />`;
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
      ? 'TextField'
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
    str += `<For _0={${processBinding(
      json.bindings.each as string,
      options,
    )}} id={self}>{${json.bindings._forName} => (
      <>${children.map((item) => blockToSwift(item, options)).join('\n')}</>
    ))}`;
  } else if (json.name === 'Show') {
    str += `{Boolean(${processBinding(
      json.bindings.when as string,
      options,
    )}) && (
      <>${children.map((item) => blockToSwift(item, options)).join('\n')}</>
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
        .map((item) => blockToSwift(item, options))
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

const processBinding = (str: string, options: ToSwiftOptions) => {
  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });
};

export const componentToSwift = (
  componentJson: JSXLiteComponent,
  options: ToSwiftOptions = {},
) => {
  const json = fastClone(componentJson);

  gettersToFunctions(json);

  let children = json.children
    .map((item) => blockToSwift(item, options))
    .join('\n');

  if (options.prettier !== false) {
    try {
      children = format(`export default (${children})`, {
        parser: 'typescript',
        plugins: [
          require('prettier/parser-typescript'), // To support running in browsers
          require('prettier/parser-postcss'),
        ],
      })
        .trim()
        .replace('export default (', '')
        .replace(/\)$/, '');
    } catch (err) {
      console.error(
        'Format error for file:',
        children,
        JSON.stringify(json, null, 2),
      );
      throw err;
    }
  }
  let str = dedent`
    import SwiftUI

    struct MyComponent: View {
      var body: some View {
        VStack {
          ${children.trim().replace(/\n/g, '\n        ')}
        }
      }
    }
  `
    // Transform XML to Swift format
    .replace(/<([a-z0-9]+)[^>]*>/gi, '$1() {')
    // Remove close tags
    .replace(/<\/[^>]*>/g, '}')
    .replace(/\s\/>/g, '}');
  return str;
};
