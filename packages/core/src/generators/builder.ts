import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { BuilderElement } from '@builder.io/sdk';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { fastClone } from '../helpers/fast-clone';
import dedent from 'dedent';
import { format } from 'prettier';
import json5 from 'json5';
import { isUpperCase } from '../helpers/is-upper-case';

const builderBlockPrefixes = ['Amp', 'Core', 'Builder', 'Raw', 'Form'];
const mapComponentName = (name: string) => {
  if (name === 'CustomCode') {
    return 'Custom Code';
  }
  for (const prefix of builderBlockPrefixes) {
    if (name.startsWith(prefix)) {
      const suffix = name.replace(prefix, '');
      if (isUpperCase(suffix[0])) {
        return `${prefix}:${name.replace(prefix, '')}`;
      }
    }
  }
  return name;
};

const componentMappers: {
  [key: string]: (
    node: JSXLiteNode,
    options: ToBuilderOptions,
  ) => BuilderElement;
} = {
  For(node, options) {
    return el({
      component: {
        name: 'Fragment',
      },
      repeat: {
        collection: node.bindings.each as string,
        itemName: node.bindings._forName as string,
      },
      children: node.children.map((node) => blockToBuilder(node, options)),
    });
  },
  Show(node, options) {
    return el({
      // TODO: the reverse mapping for this
      component: {
        name: 'Fragment',
      },
      bindings: {
        show: node.bindings.when as string,
      },
      children: node.children.map((node) => blockToBuilder(node, options)),
    });
  },
};

const el = (options: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  ...options,
});

export type ToBuilderOptions = {};

function tryFormat(code: string) {
  let str = code;
  try {
    str = format(str, {
      parser: 'babel',
      plugins: [
        require('prettier/parser-babel'), // To support running in browsers
      ],
    });
  } catch (err) {
    console.error('Format error for code:', str);
    throw err;
  }
  return str;
}

const filterEmptyTextNodes = (node: JSXLiteNode) =>
  !(
    typeof node.properties._text === 'string' &&
    !node.properties._text.trim().length
  );

const isComponent = (json: JSXLiteNode) =>
  json.name.toLowerCase() !== json.name;

export const blockToBuilder = (
  json: JSXLiteNode,
  options: ToBuilderOptions = {},
): BuilderElement => {
  const mapper = componentMappers[json.name];
  if (mapper) {
    return mapper(json, options);
  }
  if (json.properties._text || json.bindings._text) {
    return el({
      tagName: 'span',
      // responsiveStyles: {
      //   large: json.properties.css as any,
      // },
      bindings: {
        // TODO: css to responsiveStyles and back
        // ...(json.bindings as any),
        ...(json.bindings._text
          ? {
              'component.options.text': json.bindings._text as string,
              'json.bindings._text': undefined as any,
            }
          : {}),
      },
      component: {
        name: 'Text',
        options: {
          text: json.properties._text,
        },
      },
    });
  }

  const thisIsComponent = isComponent(json);

  let bindings = thisIsComponent ? {} : json.bindings;
  if (thisIsComponent) {
    for (const key in json.bindings) {
      bindings[`component.options.${key}`] = json.bindings[key];
    }
  }

  return el({
    tagName: thisIsComponent ? undefined : json.name,
    ...(json.bindings.css && {
      responsiveStyles: {
        large: json5.parse(json.bindings.css as string),
      },
    }),
    ...(thisIsComponent && {
      component: {
        name: mapComponentName(json.name),
        options: json.properties,
      },
    }),
    properties: thisIsComponent ? undefined : (json.properties as any),
    bindings: thisIsComponent ? undefined : (json.bindings as any),
    children: json.children
      .filter(filterEmptyTextNodes)
      .map((child) => blockToBuilder(child, options)),
  });
};

export const componentToBuilder = (
  componentJson: JSXLiteComponent,
  options: ToBuilderOptions = {},
) => {
  return fastClone({
    data: {
      jsCode: tryFormat(dedent`
        Object.assign(state, ${getStateObjectString(componentJson)});
      `),
      blocks: componentJson.children
        .filter(filterEmptyTextNodes)
        .map((child) => blockToBuilder(child, options)),
    },
  });
};
