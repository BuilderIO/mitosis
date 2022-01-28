import { MitosisNode } from '../../types/mitosis-node';
import { minify } from '../minify';
import {
  INDENT,
  SrcBuilder,
  NL,
  WS,
  UNINDENT,
  iteratorProperty,
} from './src-generator';

export const DIRECTIVES: Record<
  string,
  string | ((node: MitosisNode, blockFn: () => void) => void)
> = {
  Show: (node: MitosisNode, blockFn: () => void) =>
    function(this: SrcBuilder) {
      const expr = node.bindings.when;
      this.isJSX && this.emit('{', WS);
      this.emit(expr, WS, '?', INDENT, NL);
      blockFn();
      this.emit(':', WS, 'null', UNINDENT, NL);
      this.isJSX && this.emit('}', NL);
    },
  For: (node: MitosisNode, blockFn: () => void) =>
    function(this: SrcBuilder) {
      const expr = node.bindings.each!;
      this.isJSX && this.emit('{', WS);
      this.emit('(', expr, WS, '||', WS, '[])');
      this.emit('.map(', '(function(__value__)', WS, '{', INDENT, NL);
      this.emit(
        'var state',
        WS,
        '=',
        WS,
        'Object.assign({},',
        WS,
        'this,',
        WS,
        '{',
        iteratorProperty(expr),
        ':',
        WS,
        '__value__',
        WS,
        '==',
        WS,
        'null',
        WS,
        '?',
        WS,
        '{}',
        WS,
        ':',
        WS,
        '__value__',
        '});',
        NL,
      );
      this.emit('return', WS, '(');
      blockFn();
      this.emit(')', ';', UNINDENT, NL);
      this.emit('}', ').bind(state))', NL);
      this.isJSX && this.emit('}', NL);
    },
  Image: minify`${Image}`,
};

declare const h: (
  name: string,
  props: Record<string, any>,
  children?: any[],
) => any;

export function Image(props: {
  href?: string;
  image?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  sizes?: string;
  altText?: string;
  fitContent?: boolean;
  aspectRatio?: number;
  lazy?: boolean;
  class?: string;
  children?: any[];
}) {
  let jsx: any[] = props.children || [];
  const image = props.image;
  if (image) {
    const isBuilderIoImage = !!(image || '').match(/builder\.io/);
    const imgProps = {
      src: props.image,
      class: props.class,
      style:
        `object-fit:${props.backgroundSize ||
          'cover'};object-position:${props.backgroundPosition || 'center'};` +
        (props.aspectRatio
          ? 'position:absolute;height:100%;width:100%;top:0;left:0'
          : ''),
      sizes: props.sizes,
      alt: props.altText,
      loading: props.lazy ? 'lazy' : undefined,
      srcset: undefined as string | undefined,
    };
    if (isBuilderIoImage) {
      const srcset = ['100', '200', '400', '800', '1200', '1600', '2000']
        .map((size) => {
          return updateQueryParam(image, 'width', size) + ' ' + size + 'w';
        })
        .concat([image])
        .join(', ');
      imgProps.srcset = srcset;
      jsx = jsx = [
        h('picture', {}, [
          h('source', { type: 'image/webp', srcset: srcset }),
          h('img', imgProps, jsx),
          h('div', {
            class: 'builder-image-sizer',
            style: `width:100%;padding-top:${(props.aspectRatio || 1) *
              100}%;pointer-events:none;font-size:0`,
          }),
        ]),
      ];
    } else {
      jsx = [h('img', imgProps, jsx)];
    }
  }
  return h(
    props.href ? 'a' : 'div',
    { href: props.href, class: props.class },
    jsx,
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
