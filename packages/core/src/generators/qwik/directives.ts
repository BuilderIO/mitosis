import { MitosisNode } from '../../types/mitosis-node';
import { minify } from '../minify';
import { SrcBuilder, iteratorProperty } from './src-generator';

export const DIRECTIVES: Record<
  string,
  string | ((node: MitosisNode, blockFn: () => void) => void)
> = {
  Show: (node: MitosisNode, blockFn: () => void) =>
    function (this: SrcBuilder) {
      const expr = node.bindings.when;
      this.isJSX && this.emit('{');
      this.emit(expr, '?');
      blockFn();
      this.emit(':null');
      this.isJSX && this.emit('}');
    },
  For: (node: MitosisNode, blockFn: () => void) =>
    function (this: SrcBuilder) {
      const expr = node.bindings.each!;
      this.isJSX && this.emit('{');
      this.emit('(', expr, '||[]).map(', '(function(__value__){');
      this.emit(
        'var state=Object.assign({},this,{',
        iteratorProperty(expr),
        ':__value__==null?{}:__value__});',
      );
      this.emit('return(');
      blockFn();
      this.emit(');}).bind(state))');
      this.isJSX && this.emit('}');
    },
  Image: minify`${Image}`,
  CoreButton: minify`${CoreButton}`,
  __passThroughProps__: minify`${__passThroughProps__}`,
};

declare const h: (
  name: string,
  props: Record<string, any>,
  children?: any[],
) => any;

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
}

export function Image(props: ImageProps) {
  let jsx: any[] = props.children || [];
  let image = props.image;
  if (image) {
    const isBuilderIoImage = !!(image || '').match(/\.builder\.io/);
    const isPixel = props.builderBlock?.id.startsWith('builder-pixel-');
    const imgProps = {
      src: props.image,
      style:
        `object-fit:${props.backgroundSize || 'cover'};object-position:${
          props.backgroundPosition || 'center'
        };` +
        (props.aspectRatio
          ? 'position:absolute;height:100%;width:100%;top:0;left:0'
          : ''),
      sizes: props.sizes,
      alt: props.altText,
      role: !props.altText ? 'presentation' : undefined,
      loading: isPixel ? 'eager' : 'lazy',
      srcset: undefined as string | undefined,
    };
    if (isBuilderIoImage) {
      image = updateQueryParam(image, 'format', 'webp');
      const srcset = ['100', '200', '400', '800', '1200', '1600', '2000']
        .concat(props.srcsetSizes ? String(props.srcsetSizes).split(' ') : [])
        .map((size) => {
          return updateQueryParam(image, 'width', size) + ' ' + size + 'w';
        })
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
    if (
      props.aspectRatio &&
      !(props.fitContent && props.children && props.children.length)
    ) {
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
      return uri.replace(
        re,
        '$1' + key + '=' + encodeURIComponent(value) + '$2',
      );
    }

    return uri + separator + key + '=' + encodeURIComponent(value);
  }
}

export function __passThroughProps__(
  dstProps: Record<string, any>,
  srcProps: Record<string, any>,
): Record<string, any> {
  for (const key in srcProps) {
    if (
      Object.prototype.hasOwnProperty.call(srcProps, key) &&
      ((key.startsWith('on') && key.endsWith('Qrl')) || key == 'style')
    ) {
      (dstProps as any)[key] = (srcProps as any)[key];
    }
  }
  return dstProps;
}

export function CoreButton(props: {
  text?: string;
  link?: string;
  class?: string;
  openInNewTab?: string;
  tagName$: string;
}) {
  const hasLink = !!props.link;
  const hProps = {
    innerHTML: props.text || '',
    href: props.link,
    target: props.openInNewTab ? '_blank' : '_self',
    class: props.class,
  };
  return h(
    hasLink ? 'a' : props.tagName$ || 'span',
    __passThroughProps__(hProps, props),
  );
}
