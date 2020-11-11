import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { BuilderElement } from '@builder.io/sdk';
import { getStateObjectString } from '../helpers/get-state-object-string';

const el = (options: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  ...options,
});

export type ToBuilderOptions = {};

const isComponent = (json: JSXLiteNode) =>
  json.name.toLowerCase() !== json.name;

export const blockToBuilder = (
  json: JSXLiteNode,
  options: ToBuilderOptions = {},
): BuilderElement => {
  if (json.properties._text) {
    return el({
      tagName: 'span',
      responsiveStyles: {
        large: json.properties.css as any,
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
    children: json.children.map((child) => blockToBuilder(child, options)),
  });
};

export const componentToBuilder = (
  componentJson: JSXLiteComponent,
  options: ToBuilderOptions = {},
) => {
  return {
    data: {
      jsCode: `
        Object.assign(state, ${getStateObjectString(componentJson)});
      `,
      blocks: componentJson.children.map((child) =>
        blockToBuilder(child, options),
      ),
    },
  };
};
