import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';

export type BuilerToJSXLiteOptions = {};

export const builderElementToJsxLiteNode = (
  block: BuilderElement,
  options: BuilerToJSXLiteOptions = {},
): JSXLiteNode => {
  return createJSXLiteNode({
    name: block.tagName,
    properties: block.properties,
    bindings: block.bindings,
    children: (block.children || []).map((item) =>
      builderElementToJsxLiteNode(item, options),
    ),
  });
};

export const builderContentToJsxLiteComponent = (
  builderContent: BuilderContent,
  options: BuilerToJSXLiteOptions = {},
) => {
  return createJSXLiteComponent({
    state: {
      // TODO: parse this back out
    },
    children: (builderContent.data?.blocks || []).map((item) =>
      builderElementToJsxLiteNode(item, options),
    ),
  });
};
