import { types } from '@babel/core';
import * as CSS from 'csstype';
import dedent from 'dedent';
import json5 from 'json5';
import { format } from 'prettier/standalone';
import { babelTransformCode } from '../helpers/babel-transform';
import traverse from 'traverse';
import { fastClone } from '../helpers/fast-clone';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { gettersToFunctions } from '../helpers/getters-to-functions';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { stripStateAndPropsRefs } from '../helpers/strip-state-and-props-refs';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';

type ToSwiftOptions = {
  prettier?: boolean;
};

const temp = (fragment: string) => fragment;

const getStyles = (json: JSXLiteNode) => {
  if (!json.bindings.css) {
    return null;
  }
  let css: CSS.Properties;
  try {
    css = json5.parse(json.bindings.css as string);
  } catch (err) {
    console.warn('Could not json 5 parse css', err);
    return null;
  }
  return css;
};

const scrolls = (json: JSXLiteNode) => {
  return getStyles(json)?.overflow === 'auto';
};

const preSpaceRegex = /^ */g;
const getPreSpaces = (str: string) => str.match(preSpaceRegex)?.[0].length || 0;

const fixIndents = (str: string) => {
  const lines = str.split('\n');
  let last = 0;
  lines.forEach((item, index) => {
    const spaces = getPreSpaces(item);
    const maxSpaces = last + 2;
    if (spaces > maxSpaces) {
      const delta = spaces - maxSpaces;
      lines.slice(index).every((nextLine, incrIndex) => {
        const nextLineSpaces = getPreSpaces(nextLine);
        if (nextLineSpaces > maxSpaces) {
          const newItem = nextLine.replace(
            preSpaceRegex,
            ' '.repeat(nextLineSpaces - delta),
          );
          lines[index + incrIndex] = newItem;
          return true;
        } else {
          return false;
        }
      });
      last = maxSpaces;
    } else {
      last = spaces;
    }
  });
  return lines.join('\n');
};

const mappers: {
  [key: string]: (json: JSXLiteNode, options: ToSwiftOptions) => string;
} = {
  Fragment: (json, options) => {
    return `${json.children
      .map((item) => blockToSwift(item, options))
      .join('\n')}`;
  },
  Image: (json, options) => {
    return `_: Image(${
      json.bindings.image || `"${json.properties.image}"`
    })${temp(',')}`;
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
    return `_: Text("${json.properties._text
      .trim()
      .replace(/\s+/g, ' ')}")${temp(',')}`;
  }
  if (json.bindings._text) {
    return `_: Text(${processBinding(
      json.bindings._text as string,
      options,
    )})${temp(',')}`;
  }

  let str = '';

  const children = json.children.filter(filterEmptyTextNodes);

  const style = getStyles(json);

  // TODO: do as preprocess step and do more mappings of dom attributes to special
  // Image, TextField, etc component props
  const name =
    json.name === 'link'
      ? 'Unsupported'
      : json.name === 'input'
      ? 'TextField'
      : json.name === 'img'
      ? 'Image'
      : json.name[0].toLowerCase() === json.name[0]
      ? json.bindings.onClick
        ? // TODO: also map onClick to action:s
          'Button'
        : scrolls(json)
        ? 'ScrollView'
        : style?.display === 'flex' && style.flexDirection !== 'column'
        ? 'HStack'
        : 'VStack'
      : json.name;

  if (name === 'VStack' || name === 'HStack') {
    json.bindings.padding = '0';
  }

  if (json.name === 'For') {
    str += `_: <For each={${processBinding(
      json.bindings.each as string,
      options,
    )}}>{${json.bindings._forName} => ({
      ${children.map((item) => blockToSwift(item, options)).join('\n')}
    })}</For>`;
  } else if (json.name === 'Show') {
    str += `_: <Show when={${processBinding(
      json.bindings.when as string,
      options,
    )}}>{{
      ${children.map((item) => blockToSwift(item, options)).join('\n')}
    }}</Show>,`;
  } else {
    str += `_: ${name}(${temp('{')}`;

    for (const key in json.properties) {
      if (key === 'class' || key === 'className') {
        continue;
      }
      const value = json.properties[key];
      str += ` ${key}: "${(value as string).replace(/"/g, '&quot;')}", `;
    }
    for (const key in json.bindings) {
      const value = json.bindings[key] as string;
      if (
        key === '_spread' ||
        key === 'ref' ||
        key === 'css' ||
        key === 'class' ||
        key === 'className'
      ) {
        continue;
      }

      if (key.startsWith('on')) {
        let useKey = key;
        if (key === 'onClick') {
          useKey = 'action';
        }
        // TODO: replace with fn refs
        str += ` ${useKey}: () => { ${processBinding(value, options)} }, `;
      } else {
        str += ` ${key}: ${processBinding(value, options)}, `;
      }
    }
    str += `${temp('}')})`;
    for (const key in style) {
      let useKey = key;
      const rawValue = style[key as keyof CSS.Properties]!;
      let value: number | string = `"${rawValue}"`;
      if (['padding', 'margin'].includes(key)) {
        // TODO: throw error if calc()
        value = parseFloat(rawValue as string);
      }
      if (key === 'color') {
        useKey = 'foregroundColor';
        // TODO: this assumes things like `color: 'red'` - also map rgb using Color(red: ..., ....)
        value = '`.' + rawValue + '`';
      }
      str += `.${useKey}(${value})`;
    }
    str += `${temp('(')}{`;
    if (json.children) {
      str += json.children
        .map((item) => blockToSwift(item, options))
        .join('\n');
    }

    str += `}${temp('),')}`;
  }

  return str;
};

const processBinding = (str: string, options: ToSwiftOptions) => {
  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: true,
  });
};

const useTextBinding = (json: JSXLiteComponent, options: ToSwiftOptions) => {
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      const { value, onChange } = item.bindings;
      if (value && onChange) {
        if (
          (onChange as string).replace(/\s+/g, '') ===
          `${value}=event.target.value`
        ) {
          delete item.bindings.value;
          delete item.bindings.onChange;
          item.bindings.text = '$' + value;
        }
      }
    }
  });
};

const swiftMethodMap: { [key: string]: string } = {
  toLowerCase: 'lowercased',
  push: 'append',
};

const replaceSwiftMethods = (code: string) => {
  function hasSpread(nodes: babel.Node[]) {
    return Boolean(nodes.find((node) => types.isSpreadElement(node)));
  }

  function push(_props: any, nodes: babel.Node[]) {
    if (!_props.length) return _props;
    nodes.push(types.arrayExpression(_props));
    return [];
  }

  function build(props: any[], scope: any) {
    const nodes = [];
    let _props: any[] = [];

    for (const prop of props) {
      if (types.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        nodes.push(prop.argument);
      } else {
        _props.push(prop);
      }
    }

    push(_props, nodes);

    return nodes;
  }

  return babelTransformCode(code, {
    CallExpression(path: babel.NodePath<babel.types.CallExpression>) {
      const { callee } = path.node;
      if (types.isMemberExpression(callee)) {
        if (types.isIdentifier(callee.property)) {
          const mapper = swiftMethodMap[callee.property.name];
          if (mapper) {
            path.replaceWith(
              types.callExpression(
                types.memberExpression(callee.object, types.identifier(mapper)),
                path.node.arguments,
              ),
            );
          }
        }
      }
    },

    // Convert array spreads to swift concat syntax (`+` operator)
    ArrayExpression(path: babel.NodePath<babel.types.ArrayExpression>) {
      const { node, scope } = path;
      const elements = node.elements;
      if (!hasSpread(elements as any)) return;

      const nodes = build(elements, scope);
      let first = nodes[0];

      if (nodes.length === 1 && first !== (elements[0] as any).argument) {
        path.replaceWith(first);
        return;
      }

      if (!types.isArrayExpression(first)) {
        first = types.arrayExpression([]);
      } else {
        nodes.shift();
      }

      path.replaceWith(types.binaryExpression('+', nodes[0], nodes[1]));
    },
  });
};

export const componentToSwift = (
  componentJson: JSXLiteComponent,
  options: ToSwiftOptions = {},
) => {
  const json = fastClone(componentJson);

  gettersToFunctions(json);
  useTextBinding(json, options);

  let children = json.children
    .map((item) => blockToSwift(item, options))
    .join('\n');

  const dataString = getStateObjectString(json, {
    format: 'class',
    keyPrefix: '@State ',
    functions: false,
    getters: false,
    valueMapper: (code) => stripStateAndPropsRefs(code, { replaceWith: '' }),
  });

  const methodString = getStateObjectString(json, {
    format: 'class',
    data: false,
    getters: false,
    valueMapper: (code) => stripStateAndPropsRefs(code, { replaceWith: '' }),
  });

  let str = dedent`
    import "SwiftUI"

    class MyComponent {
      ${dataString}
      ${methodString}

      __body = {
        _: VStack({ padding: 0 })({
          ${children}
        })
      }
    }
  `;

  str = replaceSwiftMethods(str);

  if (options.prettier !== false) {
    try {
      str = format(str, {
        semi: false,
        singleQuote: false,
        parser: 'typescript',
        plugins: [
          require('prettier/parser-typescript'), // To support running in browsers
          require('prettier/parser-postcss'),
        ],
      });
    } catch (err) {
      console.error(
        'Format error for file:',
        err,
        '\n\n',
        str,
        '\n\n\n',
        JSON.stringify(json, null, 2),
      );
    }
  }

  // Remove JS / JSX artifacts
  str = str
    // Remove temp property prefixes
    .replace(/_:\s?/g, '')
    // Convert <Show when={...}> to if ... { ... }
    .replace(/\(\s*<Show when={([\s\S]+)}>\s*{{/g, 'if $1 {')
    .replace(/}}\s*<\/Show>\s*\),?/g, '}')
    // Deserialize html quotes
    .replace(/&quot;/g, '\\"')
    // Convert class MyComponent to struct MyComponent : View
    .replace('class MyComponent', 'struct MyComponent : View')
    // Convert @State foo = to @State private var foo =
    .replace(/@State\s+/g, '@State private var ')
    // Convert __body = to var body: some View =
    .replace(/(\s*)__body = /, '\n$1var body: some View ')
    // Convert import 'foo' to import foo;
    .replace(/import ['"]([^'"]+)['"];?/g, 'import $1')
    // Convert Foo({ too Foo(
    .replace(/([A-Z][a-zA-Z0-9]+)\({([\s\S]*?)}\)/g, '$1($2)')
    // Remove arrow function
    .replace(/\(\)\s*=>/g, '')
    // Remove dangling "()"
    .replace(/([^\w\d])\(\)/g, '$1')
    // Remove dangling "({"
    .replace(/\({/g, ' {')
    // Remove dangling "})"
    .replace(/}\),?/g, '}')
    // Remove dangling "{}"
    .replace(/ {}/g, '')
    // Convert `.foo` to .foo (escaped enum members)
    .replace(/`(\.[\w\d]+)`/g, '$1')
    // Remove dangling "),"
    .replace(/\),\n/g, ')\n')
    // Convert <For each={...}> to ForEach(...) {
    .replace(
      /\(\s*<For\s*each={([\s\S]+)}>\s*{\((.*?)\)\s*=>\s*\{/g,
      'ForEach($1, id: \\.self) { $2 in',
    )
    // Convert </For> to }
    .replace(/}}\s*<\/For>\s*\),?/g, '}');

  return fixIndents(str);
};
