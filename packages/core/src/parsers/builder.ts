import { Builder, BuilderContent, BuilderElement } from '@builder.io/sdk';
import json5 from 'json5';
import { mapKeys, omitBy, omit, upperFirst } from 'lodash';
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

const getActionBindingsFromBlock = (block: BuilderElement) => {
  const actions = {
    ...block.actions,
    ...block.code?.actions,
  };
  const bindings: any = {};
  const actionKeys = Object.keys(actions);
  if (actionKeys.length) {
    for (const key of actionKeys) {
      const useKey = `on${upperFirst(key)}`;
      bindings[useKey] = `${actions[key]}`;
    }
  }

  return bindings;
};

const getStyleStringFromBlock = (block: BuilderElement) => {
  const styleBindings: any = {};
  let styleString = '';

  if (block.bindings) {
    for (const key in block.bindings) {
      if (key.includes('style') && key.includes('.')) {
        const styleProperty = key.split('.')[1];
        styleBindings[styleProperty] =
          block.code?.bindings?.[key] || block.bindings[key];
      }
    }
  }

  const styleKeys = Object.keys(styleBindings);
  if (styleKeys.length) {
    styleString = '{';
    styleKeys.forEach((key) => {
      // TODO: figure out how to have multiline style bindings here
      // I tried (function{binding code})() and that did not work
      styleString += ` ${key}: ${styleBindings[key]
        .replace(/var _virtual_index\s*=\s*/g, '')
        .replace(/;*\s*return _virtual_index;*/, '')},`;
    });
    styleString += ' }';
  }

  return styleString;
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
  return mapKeys(
    getBlockActions(block),
    (value, key) => `on${capitalize(key)}`,
  );
};

const getBlockNonActionBindings = (block: BuilderElement) => ({
  ...block.bindings,
  ...block.code?.bindings,
});

const getBlockBindings = (
  block: BuilderElement,
  options: BuilderToJSXLiteOptions,
) => {
  const obj = {
    ...getBlockNonActionBindings(block),
    ...getBlockActionsAsBindings(block),
  };
  if (options.includeBuilderExtras) {
    for (const key in obj) {
      const value = obj[key];
      // TODO: do for all bindings with same logic builder has around returns
      if (!key.startsWith('on') && value.includes(';')) {
        // TODO: plugin/option for for this
        obj[key] = `
        (() => { 
          try { ${value} } 
          catch (err) { 
            console.warn('Builder code error', err);
          }
        })()`;
      }
    }
  }

  return obj;
};

// add back if this direction (blocks as children not prop) is desired
export const symbolBlocksAsChildren = false;

const componentMappers: {
  [key: string]: (
    block: BuilderElement,
    options: BuilderToJSXLiteOptions,
  ) => JSXLiteNode;
} = {
  Symbol(block, options) {
    let css = getCssFromBlock(block);
    const styleString = getStyleStringFromBlock(block);
    const actionBindings = getActionBindingsFromBlock(block);

    return createJSXLiteNode({
      name: 'Symbol',
      bindings: {
        symbol: JSON.stringify({
          data: block.component?.options.symbol.data,
          content: block.component?.options.symbol.content,
        }),
        ...actionBindings,
        ...(styleString && {
          style: styleString,
        }),
        ...(Object.keys(css).length && {
          css: JSON.stringify(css),
        }),
      },
    });
  },
  ...(!symbolBlocksAsChildren
    ? {}
    : {
        Symbol(block, options) {
          let css = getCssFromBlock(block);
          const styleString = getStyleStringFromBlock(block);
          const actionBindings = getActionBindingsFromBlock(block);

          const content = block.component?.options.symbol.content;
          const blocks = content?.data?.blocks;
          if (blocks) {
            content.data.blocks = null;
          }

          return createJSXLiteNode({
            name: 'Symbol',
            bindings: {
              symbol: JSON.stringify({
                data: block.component?.options.symbol.content.data,
                content: content, // TODO: convert to <SymbolInternal>...</SymbolInternal> so can be parsed
              }),
              ...actionBindings,
              ...(styleString && {
                style: styleString,
              }),
              ...(Object.keys(css).length && {
                css: JSON.stringify(css),
              }),
            },
            children: !blocks
              ? []
              : [
                  createJSXLiteNode({
                    // TODO: the Builder generator side of this converting to blocks
                    name: 'BuilderSymbolContents',
                    children: blocks.map((item: any) =>
                      builderElementToJsxLiteNode(item, options),
                    ),
                  }),
                ],
          });
        },
      }),
  Columns(block, options) {
    const node = builderElementToJsxLiteNode(block, options, {
      skipMapper: true,
    });

    delete node.bindings.columns;
    delete node.properties.columns;

    node.children = block.component?.options.columns.map(
      (col: any, index: number) =>
        createJSXLiteNode({
          name: 'Column',
          bindings: {
            width: col.width,
          },
          ...(col.link && {
            properties: {
              link: col.link,
            },
          }),
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
    const styleString = getStyleStringFromBlock(block);
    const actionBindings = getActionBindingsFromBlock(block);

    const bindings: any = {
      ...omitBy(block.bindings, (value, key) => {
        if (key === 'component.options.text') {
          return true;
        }

        if (key && key.includes('style')) {
          return true;
        }

        return false;
      }),
      ...actionBindings,
      ...(styleString && {
        style: styleString,
      }),
      ...(Object.keys(css).length && {
        css: JSON.stringify(css),
      }),
    };
    const properties = { ...block.properties };

    const innerBindings = {
      [options.preserveTextBlocks ? 'innerHTML' : '_text']: bindings[
        'component.options.text'
      ],
    };
    const innerProperties = {
      [options.preserveTextBlocks ? 'innerHTML' : '_text']: block.component!
        .options.text,
    };

    if (options.preserveTextBlocks) {
      return createJSXLiteNode({
        bindings,
        properties,
        children: [
          createJSXLiteNode({
            bindings: innerBindings,
            properties: {
              ...innerProperties,
              class: 'builder-text',
            },
          }),
        ],
      });
    }

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

export type BuilderToJSXLiteOptions = {
  context?: { [key: string]: any };
  includeBuilderExtras?: boolean;
  preserveTextBlocks?: boolean;
};
export type InternalBuilderToJSXLiteOptions = BuilderToJSXLiteOptions & {
  context: { [key: string]: any };
};

export const builderElementToJsxLiteNode = (
  block: BuilderElement,
  options: BuilderToJSXLiteOptions = {},
  _internalOptions: InternalOptions = {},
): JSXLiteNode => {
  // Special builder properties
  // TODO: support hide and repeat
  const blockBindings = getBlockBindings(block, options);
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
  const forBinding = block.repeat?.collection;
  if (forBinding) {
    const isFragment = block.component?.name === 'Fragment';
    // TODO: handle having other things, like a repeat too
    if (isFragment) {
      return createJSXLiteNode({
        name: 'For',
        bindings: {
          each: block.repeat?.collection,
          _forName: block.repeat?.itemName || 'item',
        },
        children:
          block.children?.map((child) =>
            builderElementToJsxLiteNode(child, options),
          ) || [],
      });
    } else {
      return createJSXLiteNode({
        name: 'For',
        bindings: {
          each: block.repeat?.collection,
          _forName: block.repeat?.itemName || 'item',
        },
        children: [builderElementToJsxLiteNode(omit(block, 'repeat'))],
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
      } else if (useKey.includes('style') && useKey.includes('.')) {
        const styleProperty = useKey.split('.')[1];
        // TODO: add me in
        // styleBindings[styleProperty] =
        //   block.code?.bindings?.[key] || blockBindings[key];
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

  if ((block as any).linkUrl) {
    properties.href = (block as any).linkUrl;
  }

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
  let styleString = getStyleStringFromBlock(block);
  const actionBindings = getActionBindingsFromBlock(block);

  return createJSXLiteNode({
    name:
      block.component?.name?.replace(/[^a-z0-9]/gi, '') ||
      block.tagName ||
      (block as any).linkUrl
        ? 'a'
        : 'div',
    properties,
    bindings: {
      ...bindings,
      ...actionBindings,
      ...(styleString && {
        style: styleString,
      }),
      ...(css && {
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
  options: BuilderToJSXLiteOptions = {},
) => {
  // TODO: properly parse this out
  const stateAssignRegex = /Object\.assign\(state\s*,\s*(\{[\s\S]+\n\})\s*\)/i;
  const generatedStateMatch = (
    builderContent?.data?.tsCode ||
    builderContent?.data?.jsCode ||
    ''
  )
    .trim()
    .match(stateAssignRegex);

  let state = {};
  if (generatedStateMatch?.[1]) {
    try {
      state = json5.parse(generatedStateMatch[1]);
    } catch (err) {
      console.warn('Error parsing state');
    }
  }

  const customCode = (
    builderContent.data?.tsCode ||
    builderContent.data?.jsCode ||
    ''
  )
    .replace(stateAssignRegex, '')
    .replace(/(let|const|var)\s+props\s*=\s*state;?/, '')
    .trim();

  return createJSXLiteComponent({
    state: {
      ...state,
      ...builderContent.data?.state,
    },
    hooks: {
      ...(customCode && {
        onMount: customCode,
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
