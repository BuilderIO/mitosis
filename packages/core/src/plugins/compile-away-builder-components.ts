import { mapValues, omit, pick } from 'lodash';
import { parseNode } from '../helpers/parse-node';
import { TraverseContext } from 'traverse';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { compileAwayComponents } from './compile-away-components';
import { blockToJsxLite } from '../generators/jsx-lite';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';

const getRenderOptions = (node: JSXLiteNode) => {
  return {
    ...mapValues(node.properties, (value) => `"${value}"`),
    ...mapValues(node.bindings, (value) => `{${value}}`),
  };
};

function updateQueryParam(uri = '', key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}

const wrapOutput = (node: JSXLiteNode, child: JSXLiteNode) => {
  return createJSXLiteNode({
    ...node,
    name: 'div',
    // TODO: other custom attributes
    properties: pick(
      node.properties,
      'style',
      'styles',
      'css',
      'className',
      'class',
    ),
    bindings: pick(
      node.bindings,
      'style',
      'styles',
      'css',
      'className',
      'class',
    ),
    children: [child],
  });
};

const components: {
  [key: string]: (
    node: JSXLiteNode,
    context: TraverseContext,
  ) => JSXLiteNode | void;
} = {
  // TODO: this should be noWrap
  CoreButton(node: JSXLiteNode) {
    const options = getRenderOptions(node);
    return wrapOutput(
      node,
      parseNode(`
        <a
          href=${options.link}
          target="${options.openLinkInNewTab ? '_blank' : '_self'}"
          >
          ${options.text.replace(/"/g, '')}
        </a>
      `),
    );
  },
  CustomCode(node: JSXLiteNode) {
    const options = getRenderOptions(node);
    return wrapOutput(
      node,
      createJSXLiteNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          innerHTML: node.properties.code,
        },
      }),
    );
  },
  CoreSection(node: JSXLiteNode) {
    return wrapOutput(
      node,
      parseNode(`<div
      css={{
        width: '100%',
        alignSelf: 'stretch',
        flexGrow: '1',
        boxSizing: 'border-box',
        maxWidth: '${node.properties.maxWidth || 1200}px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
    ${node.children
      .map((block) =>
        blockToJsxLite(block, {
          prettier: false,
        }),
      )
      .join('\n')}
    </div>`),
    );
  },
  Columns(node: JSXLiteNode, context) {
    const columns = node.children.filter(filterEmptyTextNodes).map((item) => ({
      width: parseFloat(item.properties.width) || 0,
      children: item.children,
    }));
    const gutterSize =
      (node.properties.getterSize && parseFloat(node.properties.getterSize)) ||
      20;

    function getWidth(index: number) {
      return (columns[index] && columns[index].width) || 100 / columns.length;
    }

    function getColumnWidth(index: number) {
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
    }
    const { properties } = node;

    return wrapOutput(
      node,
      parseNode(`
        <div
          class="builder-columns"
          css={{
            display: 'flex',
            ${
              properties.stackColumnsAt === 'never'
                ? ''
                : `
              "@media (max-width: ${
                properties.stackColumnsAt !== 'tablet' ? 639 : 999
              }px)": {
                flexDirection: "${
                  properties.reverseColumnsWhenStacked === 'true'
                    ? 'column-reverse'
                    : 'column'
                }",
                alignItems: 'stretch',
              },
            `
            }
          }}
        >
          ${columns
            .map((col, index) => {
              // TODO: pass size down in context

              return `<div
              class="builder-column"
              css={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                lineHeight: 'normal',
                width: "${getColumnWidth(index)}",
                marginLeft: "${index === 0 ? 0 : gutterSize}px",
                ${
                  properties.stackColumnsAt === 'never'
                    ? ''
                    : `
                  
                  "@media (max-width: ${
                    properties.stackColumnsAt !== 'tablet' ? 639 : 999
                  }px)": {
                    width: '100%',
                    marginLeft: 0,
                  },
                  `
                }
              }}
            >
              ${col.children
                .map((block) =>
                  blockToJsxLite(block, {
                    prettier: false,
                  }),
                )
                .join('\n')}
            </div>
          `;
            })
            .join('\n')}
        </div>
  `),
    );
  },
  Image(node: JSXLiteNode, context) {
    const options = getRenderOptions(node);
    const { backgroundSize, backgroundPosition, sizes, lazy, image } = options;
    const { srcset } = node.properties;
    const widths = [100, 200, 400, 800, 1200, 1600, 2000];

    let aspectRatio = node.bindings.aspectRatio
      ? parseFloat(node.bindings.aspectRatio as string)
      : null;
    if (typeof aspectRatio === 'number' && isNaN(aspectRatio)) {
      aspectRatio = null;
    }

    const srcSet =
      srcset ||
      `${
        (node.properties.image || '').match(/builder\.io/)
          ? widths
              .map(
                (size) =>
                  `${updateQueryParam(
                    node.properties.image,
                    'width',
                    String(size),
                  )} ${size}w`,
              )
              .concat([node.properties.image])
              .join(', ')
          : ''
      }`;

    return wrapOutput(
      node,
      parseNode(`
    <div css={{ position: 'relative' }}>
      <picture>
        ${
          srcSet && srcSet.match(/builder\.io/)
            ? `<source srcSet="${srcSet.replace(
                /\?/g,
                '?format=webp&',
              )}" type="image/webp" />`
            : ''
        }
        <img
          ${lazy ? ` loading="lazy" ` : ''}
          src=${image} 
          ${!sizes ? '' : `sizes=${sizes}`} 
          ${!srcSet ? '' : `srcSet="${srcSet}"`}
          css={{
          objectFit: ${backgroundSize || '"cover"'},
          objectPosition: ${backgroundPosition || '"cover"'},
          ${
            !aspectRatio
              ? ''
              : `
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: '0',
          left: '0',
          `
          }
        }} />
      </picture>
      ${
        aspectRatio
          ? `<div
          class="builder-image-sizer"
          css={{
            width: '100%',
            paddingTop: "${aspectRatio * 100 + '%'}",
            pointerEvents: 'none',
            fontSize: '0',
          }} />`
          : ''
      }
        ${
          node.children && node.children.length
            ? `
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
          >
            ${node.children
              .map((block) =>
                blockToJsxLite(block, {
                  prettier: false,
                }),
              )
              .join('\n')}
          </div>`
            : ''
        }
    </div>
  `),
    );
  },
};

type CompileAwayBuilderComponentsOptions = {
  only?: string[];
  omit?: string[];
};

export const compileAwayBuilderComponents = (
  pluginOptions: CompileAwayBuilderComponentsOptions = {},
) => {
  let obj = components;
  if (pluginOptions.omit) {
    obj = omit(obj, pluginOptions.omit);
  }
  if (pluginOptions.only) {
    obj = pick(obj, pluginOptions.only);
  }
  return compileAwayComponents({ components: obj });
};
