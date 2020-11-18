import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { last, omit } from 'lodash';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';

// Omit some superflous styles that can come from Builder's web importer
const styleOmitList: (
  | keyof CSSStyleDeclaration
  | 'backgroundRepeatX'
  | 'backgroundRepeatY'
)[] = [
  'backgroundRepeatX',
  'backgroundRepeatY',
  'backgroundPositionX',
  'backgroundPositionY',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopRightRadius',
  'borderTopRightRadius',
];

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

type InternalOptions = {
  skipMapper?: boolean;
};

const componentMappers: {
  [key: string]: (
    block: BuilderElement,
    options: BuilerToJSXLiteOptions,
  ) => JSXLiteNode;
} = {
  Columns(block, options) {
    const node = builderElementToJsxLiteNode(block, options, {
      skipMapper: true,
    });

    delete node.bindings.columns;
    delete node.properties.columns;

    node.children = block.component?.options.columns.map((col: any) =>
      createJSXLiteNode({
        name: 'Column',
        children: col.blocks.map((col: any) =>
          builderElementToJsxLiteNode(col, options),
        ),
      }),
    );

    return node;
  },
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
  _internalOptions: InternalOptions = {},
): JSXLiteNode => {
  const mapper =
    !_internalOptions.skipMapper &&
    block.component &&
    componentMappers[block.component!.name];

  if (mapper) {
    return mapper(block, options);
  }

  const bindings: any = {};

  if (block.bindings) {
    for (const key in block.bindings) {
      if (key === 'css') {
        continue;
      }
      const useKey = key.replace(/^(component\.)?options\./, '');
      if (!useKey.includes('.')) {
        bindings[useKey] = block.bindings[key];
      }
    }
  }
  const properties = {
    ...block.properties,
    ...block.component?.options,
  };

  return createJSXLiteNode({
    name:
      block.component?.name?.replace(/[^a-z0-9]/gi, '') ||
      block.tagName ||
      'div',
    properties,
    bindings: {
      ...bindings,
      ...(Boolean(Object.keys(block.responsiveStyles?.large || {}).length) && {
        css: JSON.stringify(
          omit(block.responsiveStyles?.large || {}, styleOmitList),
        ),
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
