import { Builder } from '@builder.io/react';
import { omit, pick } from 'lodash';
import traverse, { TraverseContext } from 'traverse';
import { createMitosisNode } from '../helpers/create-mitosis-node';
import { filterEmptyTextNodes } from '../helpers/filter-empty-text-nodes';
import { isMitosisNode } from '../helpers/is-mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import * as JSON5 from 'json5';
import { BuilderElement } from '@builder.io/sdk';
import { builderElementToMitosisNode } from '../parsers/builder';

function getComponentInputNames(componentName: string): string[] {
  const componentInfo = Builder.components.find(
    (item) => item.name === componentName,
  );
  return componentInfo?.inputs?.map((item) => item.name) || [];
}

const wrapOutput = (
  node: MitosisNode,
  child: MitosisNode | MitosisNode[],
  components: CompileAwayComponentsMap,
) => {
  const inputNames = getComponentInputNames(node.name);
  compileAwayBuilderComponentsFromTree(child as any, components);
  return createMitosisNode({
    ...node,
    properties: {
      ...omit(node.properties, ...inputNames),
    },
    bindings: {
      ...omit(node.bindings, ...inputNames),
    },
    // TODO: forward tagName as a $tagName="..."
    name: node.properties._tagName || node.properties.$tagName || 'div',
    children: Array.isArray(child) ? child : [child],
  });
};

type CompileAwayComponentsMap = {
  [key: string]: (
    node: MitosisNode,
    context: TraverseContext,
    components: CompileAwayComponentsMap,
  ) => MitosisNode | void;
};

interface AccordionItem {
  title: BuilderElement[];
  detail: BuilderElement[];
}

export const components: CompileAwayComponentsMap = {
  CoreButton(node: MitosisNode, context, components) {
    const properties: Record<string, string> = {};
    const bindings: Record<string, string> = {};

    if ('link' in node.properties) {
      properties.href = node.properties.link!;
    }
    if ('link' in node.bindings) {
      bindings.href = node.properties.link!;
    }
    if ('text' in node.properties) {
      properties.innerHTML = node.properties.text!;
    }
    if ('text' in node.bindings) {
      bindings.innerHTML = node.properties.text!;
    }
    if ('openInNewTab' in node.bindings) {
      bindings.target = `${node.bindings.openInNewTab} ? '_blank' : '_self'`;
    }

    const omitFields = ['link', 'openInNewTab', 'text'];

    const hasLink = node.properties.link || node.bindings.link;

    return createMitosisNode({
      ...node,
      name: hasLink ? 'a' : node.properties.$tagName || 'span',
      properties: {
        ...omit(node.properties, omitFields),
        ...properties,
      },
      bindings: {
        ...omit(node.bindings, omitFields),
        ...bindings,
      },
    });
  },
  Embed(node: MitosisNode, context, components) {
    return wrapOutput(
      node,
      createMitosisNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          innerHTML: node.properties.content || '',
        },
      }),
      components,
    );
  },
  BuilderAccordion(node: MitosisNode, context, components) {
    const itemsJSON = node.bindings.items || '[]';
    const accordionItems: AccordionItem[] = JSON5.parse(itemsJSON);
    const children: MitosisNode[] = accordionItems.map((accordionItem) => {
      const titleChildren: MitosisNode[] = accordionItem.title.map((element) =>
        builderElementToMitosisNode(element, {
          includeBuilderExtras: true,
          preserveTextBlocks: true,
        }),
      );
      const detailChildren: MitosisNode[] = accordionItem.detail.map(
        (element) =>
          builderElementToMitosisNode(element, {
            includeBuilderExtras: true,
            preserveTextBlocks: true,
          }),
      );
      return createMitosisNode({
        name: 'div',
        properties: { builder: 'accordion' },
        children: [
          createMitosisNode({
            name: 'div',
            properties: { builder: 'accordion-title' },
            children: titleChildren,
          }),
          createMitosisNode({
            name: 'div',
            properties: { builder: 'accordion-detail' },
            children: detailChildren,
          }),
        ],
      });
    });
    return wrapOutput(
      node,
      createMitosisNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          $name: 'accordion',
        },
        children: children,
      }),
      components,
    );
  },
  BuilderMasonry() {
    // TODO
    return createMitosisNode({
      name: 'div',
      properties: { 'data-missing-component': 'BuilderMasonry' },
    });
  },
  BuilderTabs() {
    // TODO
    return createMitosisNode({
      name: 'div',
      properties: { 'data-missing-component': 'BuilderTabs' },
    });
  },
  BuilderCarousel() {
    // TODO
    return createMitosisNode({
      name: 'div',
      properties: { 'data-missing-component': 'BuilderCarousel' },
    });
  },
  CustomCode(node: MitosisNode, context, components) {
    return wrapOutput(
      node,
      createMitosisNode({
        name: (node.properties.builderTag as string) || 'div',
        properties: {
          innerHTML: node.properties.code || '',
        },
      }),
      components,
    );
  },
  CoreSection(node: MitosisNode, context, components) {
    return wrapOutput(
      node,
      createMitosisNode({
        name: 'section',
        properties: {
          ...node.properties,
          $name: 'section',
          ...(node.bindings.lazyLoad === 'true' && {
            lazyLoad: 'true',
          }),
        },
        bindings: {
          css: JSON.stringify({
            width: '100%',
            alignSelf: 'stretch',
            flexGrow: '1',
            boxSizing: 'border-box',
            maxWidth: `${(node.bindings.maxWidth &&
              Number(node.bindings.maxWidth)) ||
              1200}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            marginLeft: 'auto',
            marginRight: 'auto',
          }),
        },
        children: node.children,
      }),
      components,
    );
  },
  Columns(node: MitosisNode, context, components) {
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
      createMitosisNode({
        name: 'div',
        properties: {
          class: 'builder-columns',
        },
        bindings: {
          css: JSON.stringify({
            display: 'flex',
            ...(properties.stackColumnsAt === 'never'
              ? {}
              : {
                  [`@media (max-width: ${
                    properties.stackColumnsAt !== 'tablet' ? 639 : 999
                  }px)`]: {
                    flexDirection:
                      properties.reverseColumnsWhenStacked === 'true'
                        ? 'column-reverse'
                        : 'column',
                    alignItems: 'stretch',
                  },
                }),
          }),
        },
        children: columns.map((col, index) => {
          return createMitosisNode({
            name: 'div',
            properties: {
              $name: 'column',
              class: 'builder-column',
            },
            bindings: {
              css: JSON.stringify({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                lineHeight: 'normal',
                width: `${getColumnWidth(index)}`,
                marginLeft: `${index === 0 ? 0 : gutterSize}px`,
                ...(properties.stackColumnsAt === 'never'
                  ? {}
                  : {
                      [`@media (max-width: ${
                        properties.stackColumnsAt !== 'tablet' ? 639 : 999
                      }px)`]: {
                        width: '100%',
                        marginLeft: 0,
                      },
                    }),
              }),
            },
            children: col.children,
          });
        }),
      }),
      components,
    );
  },
  Image(node: MitosisNode, context, components) {
    const { backgroundSize, backgroundPosition } = node.properties;
    const { srcset } = node.properties;

    let aspectRatio = node.bindings.aspectRatio
      ? parseFloat(node.bindings.aspectRatio as string)
      : null;
    if (typeof aspectRatio === 'number' && isNaN(aspectRatio)) {
      aspectRatio = null;
    }

    const image = node.properties.image!;
    const srcSet = srcset || generateBuilderIoSrcSet(image);
    const source =
      node.bindings.noWebp !== 'true' &&
      createMitosisNode({
        name: 'source',
        properties: {
          srcset: srcSet.replace(/\?/g, '?format=webp&'),
          type: 'image/webp',
        },
      });
    const img = createMitosisNode({
      name: 'img',
      properties: noUndefined({
        $name: 'image',
        loading: node.properties.lazy ? 'lazy' : undefined,
        src: node.properties.image,
        sizes: node.properties.sizes,
        srcset: srcSet || null,
      }),
      bindings: noUndefined({
        loading: node.bindings.lazy ? '"lazy"' : undefined,
        src: node.bindings.image,
        sizes: node.bindings.sizes,
        css: JSON.stringify({
          objectFit: backgroundSize || 'cover',
          objectPosition: backgroundPosition || 'cover',
          ...(aspectRatio
            ? {
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: '0',
                left: '0',
              }
            : {}),
        }),
      }),
    });

    const picture = createMitosisNode({
      name: 'picture',
      children: source ? [source, img] : [img],
    });

    const imgSizer =
      aspectRatio &&
      createMitosisNode({
        name: 'div',
        properties: {
          $name: 'image-sizer',
          class: 'builder-image-sizer',
        },
        bindings: {
          css: JSON.stringify({
            width: '100%',
            paddingTop: aspectRatio * 100 + '%',
            pointerEvents: 'none',
            fontSize: '0',
          }),
        },
      });

    const children =
      node.children &&
      node.children.length &&
      createMitosisNode({
        name: 'div',
        properties: {
          $name: 'image-contents',
        },
        bindings: {
          css: JSON.stringify({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }),
        },
        children: node.children,
      });

    const imageNodes = [picture];
    imgSizer && imageNodes.push(imgSizer);
    children && imageNodes.push(children);

    const href = node.properties.href;
    const hrefBinding = node.bindings.href;
    if (href || hrefBinding) {
      const aHref = createMitosisNode({
        name: 'a',
        properties: {
          href: href,
        },
        bindings: {
          href: hrefBinding,
        },
        children: imageNodes,
      });
      return wrapOutput(node, aHref, components);
    } else {
      return wrapOutput(node, imageNodes, components);
    }
  },
  Video(node: MitosisNode, context, components) {
    let aspectRatio = node.bindings.aspectRatio
      ? parseFloat(node.bindings.aspectRatio as string)
      : null;
    if (typeof aspectRatio === 'number' && isNaN(aspectRatio)) {
      aspectRatio = null;
    }
    const videoContainerNodes: MitosisNode[] = [];

    videoContainerNodes.push(
      createMitosisNode({
        name: 'video',
        properties: noUndefined({
          $name: 'builder-video',
          poster: node.properties.posterImage,
          autoplay: node.properties.autoPlay,
          muted: node.properties.muted,
          controls: node.properties.controls,
          loop: node.properties.loop,
          playsinline: node.properties.playsInline,
          preload: node.properties.lazy ? 'none' : undefined,
        }),
        bindings: noUndefined({
          poster: node.bindings.posterImage,
          autoplay: node.bindings.autoPlay,
          muted: node.bindings.muted,
          controls: node.bindings.controls,
          playsinline: node.bindings.playsInline,
          loop: node.bindings.loop,
          css: JSON.stringify({
            width: '100%',
            height: '100%',
            objectFit: node.properties.fit,
            objectPosition: node.properties.position,
            borderRadius: '1',
            position: aspectRatio ? 'absolute' : '',
          }),
        }),
        children: [
          createMitosisNode({
            name: 'source',
            properties: {
              type: 'video/mp4',
              src: node.properties.video,
            },
            bindings: {
              src: node.bindings.video,
            },
          }),
        ],
      }),
    );

    aspectRatio &&
      videoContainerNodes.push(
        createMitosisNode({
          name: 'div',
          properties: {
            $name: 'builder-video-sizer',
          },
          bindings: {
            css: JSON.stringify({
              width: '100%',
              paddingTop: aspectRatio * 100 + '%',
              pointerEvents: 'none',
              fontSize: '0',
            }),
          },
        }),
      );

    node.children &&
      node.children.length &&
      videoContainerNodes.push(
        createMitosisNode({
          name: 'div',
          properties: {
            $name: 'image-contents',
          },
          bindings: {
            css: JSON.stringify({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }),
          },
          children: node.children,
        }),
      );

    const videoContainer = createMitosisNode({
      name: 'div',
      properties: {
        $name: 'video-container',
      },
      bindings: {
        css: JSON.stringify({ position: 'relative' }),
      },
      children: videoContainerNodes,
    });
    return wrapOutput(node, videoContainer, components);
  },
};

type CompileAwayBuilderComponentsOptions = {
  only?: string[];
  omit?: string[];
};

export const compileAwayBuilderComponentsFromTree = (
  tree: MitosisNode | MitosisComponent,
  components: CompileAwayComponentsMap,
) => {
  traverse(tree).forEach(function(item) {
    if (isMitosisNode(item)) {
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
      pre: (json: MitosisComponent) => {
        compileAwayBuilderComponentsFromTree(json, components);
      },
    },
  });
};

function updateQueryParam(uri = '', key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}

function generateBuilderIoSrcSet(image: string): string {
  const isBuilderIo = !!(image || '').match(/builder\.io/);
  return isBuilderIo
    ? [100, 200, 400, 800, 1200, 1600, 2000]
        .map(
          (size) =>
            `${updateQueryParam(image, 'width', String(size))} ${size}w`,
        )
        .concat([image])
        .join(', ')
    : '';
}

function noUndefined(obj: Record<string, any>): Record<string, any> {
  const cleanObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value != null) {
        cleanObj[key] = value;
      }
    }
  }
  return cleanObj;
}
