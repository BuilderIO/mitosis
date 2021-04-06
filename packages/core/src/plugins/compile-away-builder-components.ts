import { mapValues, omit, pick } from 'lodash';
import { parseNode, parseNodes } from '../helpers/parse-node';
import traverse, { TraverseContext } from 'traverse';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { blockToJsxLite } from '../generators/jsx-lite';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { JSXLiteComponent } from '../types/jsx-lite-component';

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

const wrapOutput = (
  node: JSXLiteNode,
  child: JSXLiteNode | JSXLiteNode[],
  components: CompileAwayComponentsMap,
) => {
  compileAwayBuilderComponentsFromTree(child as any, components);
  return createJSXLiteNode({
    ...node,
    // TODO: forward tagName as a $tagName="..."
    name: node.properties._tagName || node.properties.$tagName || 'div',
    children: Array.isArray(child) ? child : [child],
  });
};

type CompileAwayComponentsMap = {
  [key: string]: (
    node: JSXLiteNode,
    context: TraverseContext,
    components: CompileAwayComponentsMap,
  ) => JSXLiteNode | void;
};

export const components: CompileAwayComponentsMap = {
  // TODO: this should be noWrap
  CoreButton(node: JSXLiteNode, context, components) {
    const options = getRenderOptions(node);
    return wrapOutput(
      node,
      parseNode(`
        <a
          href=${options.link || '""'}
          target="${options.openLinkInNewTab ? '_blank' : '_self'}"
          >
          ${options.text.replace(/"/g, '')}
        </a>
      `),
      components,
    );
  },
  Embed(node: JSXLiteNode, context, components) {
    return wrapOutput(
      node,
      createJSXLiteNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          innerHTML: node.properties.content,
        },
      }),
      components,
    );
  },
  CustomCode(node: JSXLiteNode, context, components) {
    const options = getRenderOptions(node);
    return wrapOutput(
      node,
      createJSXLiteNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          innerHTML: node.properties.code,
        },
      }),
      components,
    );
  },
  CoreSection(node: JSXLiteNode, context, components) {
    return wrapOutput(
      node,
      parseNode(`<div
      $name="section"
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
      components,
    );
  },
  Columns(node: JSXLiteNode, context, components) {
    const columns = node.children.filter(filterEmptyTextNodes).map((item) => ({
      width:
        parseFloat(item.properties.width || item.bindings.width || '0') || 0,
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
          $name="columns"
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
              $name="column"
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
      components,
    );
  },
  Image(node: JSXLiteNode, context, components) {
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
              .concat([node.properties.image!])
              .join(', ')
          : ''
      }`;

    return wrapOutput(
      node,
      parseNodes(`
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
          $name="image"
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
          $name="image-sizer"
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
            $name="image-contents"
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
      `),
      components,
    );
  },
  Video(node: JSXLiteNode, context, components) {
    const options = getRenderOptions(node);
    let aspectRatio = node.bindings.aspectRatio
      ? parseFloat(node.bindings.aspectRatio as string)
      : null;
    if (typeof aspectRatio === 'number' && isNaN(aspectRatio)) {
      aspectRatio = null;
    }

    const str = `
    <div $name="video-container" css={{ position: 'relative' }}>
      <video
        ${options.posterImage ? `poster=${options.posterImage}` : ''}
        ${options.autoPlay ? `autoPlay=${options.autoPlay}` : ''}
        ${options.muted ? `muted=${options.muted}` : ''}
        ${options.controls ? `controls=${options.controls}` : ''}
        ${options.loop ? `loop=${options.loop}` : ''}
        ${options.lazy ? 'preload="none"' : ''}
        $name="builder-video"
        css={{
          width: '100%',
          height: '100%',
          ${options.fit ? `objectFit: ${options.fit},` : ''}
          ${options.position ? `objectPosition: ${options.position},` : ''}
          borderRadius: '1',
          ${aspectRatio ? `position: "absolute",` : ''}
        }}
      >
        <source type="video/mp4" src=${options.video} />
      </video>
      ${
        !aspectRatio
          ? ''
          : `
        <div
          $name="builder-video-sizer"
          css={{
            width: '100%',
            paddingTop: '${aspectRatio * 100 + '%'}',
            pointerEvents: 'none',
            fontSize: '0'
          }}
        />
      `
      }
      ${
        node.children && node.children.length
          ? `
        <div
          $name="video-contents"
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%'
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
    `;

    const output = wrapOutput(node, parseNodes(str), components);

    return output;
  },
};

type CompileAwayBuilderComponentsOptions = {
  only?: string[];
  omit?: string[];
};

export const compileAwayBuilderComponentsFromTree = (
  tree: JSXLiteNode | JSXLiteComponent,
  components: CompileAwayComponentsMap,
) => {
  traverse(tree).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      const mapper = components[item.name];
      if (mapper) {
        const result = mapper(item, this, components);
        if (result) {
          this.update(result);
        }
      }
    }
  });
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

  return (options?: any) => ({
    json: {
      pre: (json: JSXLiteComponent) => {
        compileAwayBuilderComponentsFromTree(json, components);
      },
    },
  });
};
