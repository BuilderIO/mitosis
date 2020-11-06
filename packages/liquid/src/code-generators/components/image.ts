import { BuilderElement } from '@builder.io/sdk';
import { blockToLiquid } from '../functions/block-to-liquid';
import { style } from '../functions/style';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { getShopifyImageUrl } from '../functions/get-shopify-image-url';
import dedent from 'dedent';

function updateQueryParam(uri = '', key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}

export const Image = component({
  name: 'Image',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const {
      aspectRatio,
      backgroundSize,
      backgroundPosition,
      srcset,
      sizes,
      image,
      lazy,
      altText,
    } = options;
    const widths = [100, 200, 400, 800, 1200, 1600, 2000];

    let useSrcSet = '';
    const useImage = (image && image.trim()) || '';
    let liquidSrcset = '';
    let useSizes = '';
    let builderWebpSrcset = '';

    if (srcset) {
      useSrcSet = srcset;
    } else if (useImage.match(/builder\.io/)) {
      useSrcSet = widths
        .map(size => `${updateQueryParam(useImage, 'width', String(size))} ${size}w`)
        .concat([useImage])
        .join(', ');
      builderWebpSrcset = widths
        .map(size => {
          const urlWithWidth = updateQueryParam(useImage, 'width', String(size));
          const urlWithType = updateQueryParam(urlWithWidth, 'format', 'webp');
          return `${urlWithType} ${size}w`;
        })
        .concat([updateQueryParam(useImage, 'format', 'webp')])
        .join(', ');
    } else if (useImage.match(/cdn\.shopify\.com/)) {
      useSrcSet = widths
        .map(size => [getShopifyImageUrl(useImage, `${size}x${size}`), size])
        .filter(([sizeUrl]) => !!sizeUrl)
        .map(([sizeUrl, size]) => `${sizeUrl} ${size}w`)
        .concat([useImage])
        .join(', ');
    } else if (useImage) {
      const imageWithoutBindings = useImage.replace(/[\{\}]/g, '').trim();

      if (imageWithoutBindings.match(/\w/)) {
        liquidSrcset = dedent`
          {%- assign _img_url = ${imageWithoutBindings} | img_url: '1x1' -%}
          {%- assign _use_img_url = _img_url | replace: '_1x1.', '.' -%}
          {%- if _img_url contains 'cdn.shopify.com' -%}
            {%- assign _image_widths = '${widths.join(',')}' | split: ',' -%}
            {%- capture _srcset -%}
              {%- for width in _image_widths -%}
                {%- capture width_replace -%}
                  {{-'_'-}}{{-width-}}{{-'x'-}}{{-width-}}{{-'.'-}}
                {%- endcapture -%}
                {%- assign _img_url_width = _img_url | replace: '_1x1.', width_replace -%}
                {{ _img_url_width }} {{ width }}w,
              {%- endfor -%}
              {{ _use_img_url }}
            {%- endcapture -%}
          {%- else -%}
            {%- assign _srcset = _use_img_url -%}
          {%- endif -%}
        `;
      }
    }

    if (sizes) {
      useSizes = sizes;
    } else if (block.responsiveStyles) {
      const generatedSizes = [];
      let hasSmallOrMediumSize = false;
      const unitRegex = /^\d+/;

      if (block.responsiveStyles?.small?.width?.match(unitRegex)) {
        hasSmallOrMediumSize = true;
        const mediaQuery = '(max-width: 639px)';
        const widthAndQuery = `${mediaQuery} ${block.responsiveStyles.small.width.replace(
          '%',
          'vw'
        )}`;
        generatedSizes.push(widthAndQuery);
      }

      if (block.responsiveStyles?.medium?.width?.match(unitRegex)) {
        hasSmallOrMediumSize = true;
        const mediaQuery = '(max-width: 999px)';
        const widthAndQuery = `${mediaQuery} ${block.responsiveStyles.medium.width.replace(
          '%',
          'vw'
        )}`;
        generatedSizes.push(widthAndQuery);
      }

      if (block.responsiveStyles?.large?.width) {
        const width = block.responsiveStyles.large.width.replace('%', 'vw');
        generatedSizes.push(width);
      } else if (hasSmallOrMediumSize) {
        generatedSizes.push('100vw');
      }

      if (generatedSizes.length) {
        useSizes = generatedSizes.join(', ');
      }
    }

    if (!liquidSrcset) {
      liquidSrcset = `{%- assign _srcset = '${useSrcSet.replace(
        '\n',
        ''
      )}' -%}{%- assign _use_img_url = '${useImage}' -%}`;
    }

    return dedent`
      ${renderOptions.static ? '' : liquidSrcset}

      <picture>
        ${
          useSrcSet && useSrcSet.match(/builder\.io/)
            ? `<source srcset="${builderWebpSrcset}" sizes="${useSizes}" type="image/webp" />`
            : ''
        }
        ${
          lazy
            ? ''
            : `<img
          src="${renderOptions.static ? options.image : '{{ _use_img_url }}'}"
          srcset="${renderOptions.static ? useSrcSet : '{{ _srcset }}'}"
          sizes="${useSizes}"
          alt="${altText || ''}"
          style="${style({
            objectFit: backgroundSize || 'cover',
            objectPosition: backgroundPosition || 'center',
            ...(aspectRatio && {
              position: 'absolute',
              height: '100%',
              width: '100%',
              top: '0',
              left: '0',
            }),
          })}" />`
        }
      </picture>
      ${
        aspectRatio
          ? `<div
          class="builder-image-sizer"
          style="${style({
            width: '100%',
            paddingTop: aspectRatio * 100 + '%',
            pointerEvents: 'none',
            fontSize: '0',
          })}"></div>`
          : ''
      }
      ${
        block.children && block.children.length
          ? `
        <div
          style="${style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          })}"
        >
          ${block.children
            .map((block: BuilderElement, index: number) => blockToLiquid(block, renderOptions))
            .join('\n')}
        </div>`
          : ''
      }
`;
  },
});
