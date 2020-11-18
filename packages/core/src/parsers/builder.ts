import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { omit } from 'lodash';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';

const hasStyles = (block: BuilderElement) => {
  if (block.responsiveStyles) {
    for (const key in block.responsiveStyles) {
      if (Object.keys((block.responsiveStyles as any)[key]!).length) {
        return true;
      }
    }
  }
  return false;
};

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
  Text: (block, options) => {
    const bindings: any = {
      ...omit(block.bindings, 'component.options.text'),
      ...(Boolean(Object.keys(block.responsiveStyles?.large || {}).length) && {
        css: JSON.stringify(block.responsiveStyles?.large || {}),
      }),
    };
    const properties = { ...block.properties };

    const innerBindings = {
      _text: block.bindings?.['component.options.text'],
    };
    const innerProperties = {
      _text: block.component!.options.text,
    };

    if ((block.tagName && block.tagName !== 'div') || hasStyles(block)) {
      return createJSXLiteNode({
        bindings,
        properties,
        children: [
          createJSXLiteNode({
            bindings: innerBindings,
            properties: innerProperties,
          }),
        ],
      });
    }
    return createJSXLiteNode({
      name: block.tagName,
      properties: {
        ...properties,
        ...innerProperties,
      },
      bindings: {
        ...bindings,
        ...innerBindings,
      },
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

  if (block.bindings) {
    for (const key in block.bindings) {
      const useKey = key.replace(/$(component\.)?options\./, '');
      if (!useKey.includes('.')) {
        bindings[useKey] = block.bindings[key];
      }
    }
  }
  const properties = {
    ...block.properties,
  };

  return createJSXLiteNode({
    name: block.component?.name || block.tagName || 'div',
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
