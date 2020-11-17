import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { isTemplateExpression } from 'typescript';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';

const componentMappers: {
  [key: string]: (
    block: BuilderElement,
    options: BuilerToJSXLiteOptions,
  ) => JSXLiteNode;
} = {
  'Shopify:For': (block, options) => {
    return createJSXLiteNode({
      name: 'For',
      bindings: {
        _forName: block.component!.options!.repeat!.itemName,
        each: `state.${block.component!.options!.repeat!.collection}`,
      },
      children: (block.children || []).map((child) =>
        builderElementToJsxLiteNode(child, options),
      ),
    });
  },
};

export type BuilerToJSXLiteOptions = {};

export const builderElementToJsxLiteNode = (
  block: BuilderElement,
  options: BuilerToJSXLiteOptions = {},
): JSXLiteNode => {
  const mapper = block.component && componentMappers[block.component!.name];

  if (mapper) {
    return mapper(block, options);
  }

  const bindings: any = {};
  // TODO: more
  if (block.bindings?.['component.options.text']) {
    bindings._text = block.bindings?.['component.options.text'];
  }
  if (block.bindings) {
    for (const key in block.bindings) {
      if (!key.includes('.')) {
        bindings[key] = block.bindings[key];
      }
    }
  }
  const properties = {
    ...block.properties,
  };
  if (block.component?.name === 'Text') {
    properties._text = block.component.options.text?.replace(/<\/?p>/g, '');
  }
  return createJSXLiteNode({
    name: block.tagName || 'div',
    properties,
    bindings: {
      ...bindings,
      ...(Boolean(Object.keys(block.responsiveStyles?.large || {}).length) && {
        css: JSON.stringify(block.responsiveStyles?.large || {}),
      }),
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
  const generatedStateMatch = (builderContent?.data?.jsCode || '')
    .trim()
    .match(/Object\.assign\(state\s*,\s*(\{[\s\S]+\})\s*\)/i);

  let state = {};
  if (generatedStateMatch?.[1]) {
    try {
      state = json5.parse(generatedStateMatch[1]);
    } catch (err) {
      console.warn('Error parsing state');
    }
  }

  return createJSXLiteComponent({
    state,
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
