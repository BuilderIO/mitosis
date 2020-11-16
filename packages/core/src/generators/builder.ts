import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { BuilderElement } from '@builder.io/sdk';
import { getStateObjectString } from '../helpers/get-state-object-string';
import { fastClone } from '../helpers/fast-clone';
import dedent from 'dedent';
import { format } from 'prettier';

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
  return el({
    tagName: isComponent(json) ? 'span' : json.name,
    properties: json.properties as any,
    bindings: json.bindings as any,
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
