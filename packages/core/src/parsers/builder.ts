import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { isTemplateExpression } from 'typescript';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';

export type BuilerToJSXLiteOptions = {};

export const builderElementToJsxLiteNode = (
  block: BuilderElement,
  options: BuilerToJSXLiteOptions = {},
): JSXLiteNode => {
  return createJSXLiteNode({
    name: block.tagName || 'div',
    properties: {
      ...block.properties,
    },
    bindings: {
      ...block.bindings,
      css: JSON.stringify(block.responsiveStyles?.large || {}),
    },
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
    children: (builderContent.data?.blocks || [])
      .filter((item) => {
        if (item.properties?.src?.includes('/api/v1/pixel')) {
          return false;
        }
        return true;
      })
      .map((item) => builderElementToJsxLiteNode(item, options)),
  });
};
