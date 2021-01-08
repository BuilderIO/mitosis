import { BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { mapKeys, omit } from 'lodash';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { sizes, Size, sizeNames } from '../constants/media-sizes';
import { capitalize } from '../helpers/capitalize';

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

const getCssFromBlock = (block: BuilderElement) => {
  const blockSizes: Size[] = Object.keys(
    block.responsiveStyles || {},
  ).filter((size) => sizeNames.includes(size as Size)) as Size[];
  let css: { [key: string]: Partial<CSSStyleDeclaration> } = {};
  for (const size of blockSizes) {
    if (size === 'large') {
      css = omit(
        {
          ...css,
          ...block.responsiveStyles?.large,
        },
        styleOmitList,
      ) as typeof css;
    } else if (block.responsiveStyles && block.responsiveStyles[size]) {
      const mediaQueryKey = `@media (max-width: ${sizes[size].max}px)`;
      css[mediaQueryKey] = omit(
        {
          ...css[mediaQueryKey],
          ...block.responsiveStyles[size],
        },
        styleOmitList,
      );
    }
  }

  return css;
};

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

const getBlockActions = (block: BuilderElement) => ({
  ...block.actions,
  ...block.code?.actions,
});

const getBlockActionsAsBindings = (block: BuilderElement) => {
  return mapKeys(getBlockActions(block), (key) => `on${capitalize(key)}`);
};

const getBlockNonActionBindings = (block: BuilderElement) => ({
  ...block.bindings,
  ...block.code?.bindings,
});

const getBlockBindings = (block: BuilderElement) => ({
  ...getBlockNonActionBindings(block),
  ...getBlockActionsAsBindings(block),
});

const componentMappers: {
  [key: string]: (
    block: BuilderElement,
    options: BuilerToJSXLiteOptions,
  ) => JSXLiteNode;
} = {
  Symbol(block, options) {
    const node = builderElementToJsxLiteNode(
      omit(block, 'component.options.symbol.content'),
      options,
      {
        skipMapper: true,
      },
    );

    // TODO: full component code in a new component and hoist it. will need to pass through a `context` object, maybe on options
    const blocks = block.component?.options?.symbol?.content?.data?.blocks;
    if (blocks) {
      node.children = blocks.map((child: any) =>
        builderElementToJsxLiteNode(child, options),
      );
      node.bindings.useChildren = 'true';
    }

    return node;
  },
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
    let css = getCssFromBlock(block);
    const blockBindings = getBlockBindings(block);
    const bindings: any = {
      ...omit(blockBindings, 'component.options.text'),
      ...(Object.keys(css).length && {
        css: JSON.stringify(css),
      }),
    };
    const properties = { ...block.properties };

    const innerBindings = {
      _text: blockBindings['component.options.text'],
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
      name: block.tagName || 'div',
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

export type BuilerToJSXLiteOptions = {
  context?: { [key: string]: any };
  includeBuilderExtras?: boolean;
};
export type InternalBuilerToJSXLiteOptions = BuilerToJSXLiteOptions & {
  context: { [key: string]: any };
};

export const builderElementToJsxLiteNode = (
  block: BuilderElement,
  options: BuilerToJSXLiteOptions = {},
  _internalOptions: InternalOptions = {},
): JSXLiteNode => {
  // Special builder properties
  // TODO: support hide and repeat
  const blockBindings = getBlockBindings(block);
  const showBinding = blockBindings.show;
  if (showBinding) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createJSXLiteNode({
        name: 'Show',
        bindings: {
          when: showBinding,
        },
        children:
          block.children?.map((child) =>
            builderElementToJsxLiteNode(child, options),
          ) || [],
      });
    } else {
      return createJSXLiteNode({
        name: 'Show',
        bindings: {
          when: showBinding,
        },
        children: [
          builderElementToJsxLiteNode({
            ...block,
            bindings: omit(blockBindings, 'show'),
          }),
        ],
      });
    }
  }
  const mapper =
    !_internalOptions.skipMapper &&
    block.component &&
    componentMappers[block.component!.name];

  if (mapper) {
    return mapper(block, options);
  }

  const bindings: any = {};

  if (blockBindings) {
    for (const key in blockBindings) {
      if (key === 'css') {
        continue;
      }
      const useKey = key.replace(/^(component\.)?options\./, '');
      if (!useKey.includes('.')) {
        bindings[useKey] = blockBindings[key];
      }
    }
  }

  const properties: { [key: string]: string } = {
    ...block.properties,
    ...(options.includeBuilderExtras && {
      ['builder-id']: block.id!,
      class: `builder-block ${block.id} ${block.properties?.class || ''}`,
    }),
  };

  if (block.component?.options) {
    for (const key in block.component.options) {
      const value = block.component.options[key];
      if (typeof value === 'string') {
        properties[key] = value;
      } else {
        bindings[key] = json5.stringify(value);
      }
    }
  }

  if (block.component && block.tagName && block.tagName !== 'div') {
    properties.builderTag = block.tagName;
  }

  const css = getCssFromBlock(block);

  return createJSXLiteNode({
    name:
      block.component?.name?.replace(/[^a-z0-9]/gi, '') ||
      block.tagName ||
      'div',
    properties,
    bindings: {
      ...bindings,
      ...(Object.keys(css).length && {
        css: JSON.stringify(css),
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

  const customCode = builderContent.data?.tsCode || builderContent.data?.jsCode;

  return createJSXLiteComponent({
    state: {
      ...state,
      ...builderContent.data?.state,
    },
    hooks: {
      ...(customCode && {
        init: `
          try {
            ${customCode}
          } catch (err) {
            console.error('Builder custom code error', err)
          }
        `,
      }),
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
