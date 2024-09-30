import { getForArguments } from '@/helpers/nodes/for';
import { ForNode, MitosisNode } from '@/types/mitosis-node';
import { minify } from '../helpers/minify';
import { SrcBuilder, iteratorProperty } from './src-generator';

export const DIRECTIVES: Record<
  string,
  string | ((node: MitosisNode, blockFn: () => void) => void)
> = {
  Show: (node: MitosisNode, blockFn: () => void) =>
    function (this: SrcBuilder) {
      const expr = node.bindings.when?.code;
      const elseBlockFn = (blockFn as { else?: () => void }).else;
      this.jsxExpression(() => {
        this.emit(expr, '?');
        blockFn();
        this.emit(':');
        if (elseBlockFn) {
          elseBlockFn();
        } else {
          this.emit('null');
        }
      });
    },
  For: (_node: MitosisNode, blockFn: () => void) =>
    function (this: SrcBuilder) {
      const node = _node as ForNode;
      const expr = node.bindings.each?.code!;
      this.jsxExpression(() => {
        const forArgs = getForArguments(node);
        const forName = forArgs[0];
        this.emit('(', expr, '||[]).map(');

        this.isBuilder && this.emit('((');

        this.emit('(', forArgs, ') => {');

        if (this.isBuilder) {
          this.emit(
            'const l={...this,',
            iteratorProperty(expr),
            ':',
            forName,
            '==null?{}:',
            forName,
            ',',
            () =>
              forArgs.forEach((arg) => {
                this.emit(arg, ':', arg, ',');
              }),
            '};',
          );
          this.emit('const state = __proxyMerge__(s,l);');
        }
        this.emit('return(');
        blockFn();
        this.emit(');}');
        this.isBuilder && this.emit(').bind(l))');
        this.emit(')');
      });
    },
  Image: minify`${Image}`,
  CoreButton: minify`${CoreButton}`,
  __passThroughProps__: minify`${__passThroughProps__}`,
  __proxyMerge__: minify`${__proxyMerge__}`,
};

declare const h: (name: string, props: Record<string, any>, children?: any[]) => any;

interface ImageProps {
  altText?: string;
  image?: string;
  href?: string;
  height?: number;
  width?: number;
  builderBlock?: any;
  attributes?: any;
  sizes?: string;
  srcsetSizes?: string;
  srcset?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  fitContent?: boolean;
  aspectRatio?: number;
  lazy?: boolean;
  class?: string;
  children?: any[];
  noWebp?: boolean;
}

export function Image(props: ImageProps) {
  let jsx: any[] = props.children || [];
  let image = props.image;
  if (image) {
    const isBuilderIoImage = !!(image || '').match(/\.builder\.io/) && !props.noWebp;
    const isPixel = props.builderBlock?.id.startsWith('builder-pixel-');
    const imgProps = {
      src: props.image,
      style:
        `object-fit:${props.backgroundSize || 'cover'};object-position:${
          props.backgroundPosition || 'center'
        };` + (props.aspectRatio ? 'position:absolute;height:100%;width:100%;top:0;left:0' : ''),
      sizes: props.sizes,
      alt: props.altText,
      role: !props.altText ? 'presentation' : undefined,
      loading: isPixel ? 'eager' : 'lazy',
      srcset: undefined as string | undefined,
    };
    const qwikBugWorkaround = (imgProps: any) =>
      Object.keys(imgProps).forEach(
        (k) => (imgProps as any)[k] === undefined && delete (imgProps as any)[k],
      );
    qwikBugWorkaround(imgProps);
    if (isBuilderIoImage) {
      const webpImage = updateQueryParam(image, 'format', 'webp');
      const srcset = ['100', '200', '400', '800', '1200', '1600', '2000']
        .concat(props.srcsetSizes ? String(props.srcsetSizes).split(' ') : [])
        .map((size) => {
          return updateQueryParam(webpImage, 'width', size) + ' ' + size + 'w';
        })
        .concat(tryAppendWidth(image))
        .join(', ');
      imgProps.srcset = srcset;
      jsx = jsx = [
        h('picture', {}, [
          h('source', { type: 'image/webp', srcset: srcset }),
          h('img', imgProps, jsx),
        ]),
      ];
    } else {
      jsx = [h('img', imgProps, jsx)];
    }
    if (props.aspectRatio && !(props.fitContent && props.children && props.children.length)) {
      const sizingDiv = h('div', {
        class: 'builder-image-sizer',
        style: `width:100%;padding-top:${
          (props.aspectRatio || 1) * 100
        }%;pointer-events:none;font-size:0`,
      });
      jsx.push(sizingDiv);
    }
  }
  const children = props.children ? [jsx].concat(props.children) : [jsx];
  return h(
    props.href ? 'a' : 'div',
    __passThroughProps__({ href: props.href, class: props.class }, props),
    children,
  );

  function updateQueryParam(uri = '', key: string, value: string) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
    }

    return uri + separator + key + '=' + encodeURIComponent(value);
  }

  function tryAppendWidth(url: string) {
    const match = url.match(/[?&]width=(\d+)/);
    const width = match && match[1];
    if (width) {
      return [url + ' ' + width + 'w'];
    }
    return [];
  }
}

function __passThroughProps__(
  dstProps: Record<string, any>,
  srcProps: Record<string, any>,
): Record<string, any> {
  for (const key in srcProps) {
    if (
      Object.prototype.hasOwnProperty.call(srcProps, key) &&
      ((key.startsWith('on') && key.endsWith('$')) || key == 'style')
    ) {
      (dstProps as any)[key] = (srcProps as any)[key];
    }
  }
  return dstProps;
}

function CoreButton(props: {
  text?: string;
  link?: string;
  class?: string;
  openInNewTab?: string;
  tagName$: string;
}) {
  const hasLink = !!props.link;
  const hProps = {
    dangerouslySetInnerHTML: props.text || '',
    href: props.link,
    target: props.openInNewTab ? '_blank' : '_self',
    class: props.class,
  };
  return h(hasLink ? 'a' : props.tagName$ || 'span', __passThroughProps__(hProps, props));
}

function __proxyMerge__(state: any, local: any) {
  return new Proxy(state, {
    get: (obj: any, prop: any) => {
      if (local && prop in local) {
        return local[prop];
      } else {
        return state[prop];
      }
    },
    set: (obj: any, prop: any, value: any) => {
      obj[prop] = value;
      return true;
    },
  });
}
