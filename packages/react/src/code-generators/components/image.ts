import { BuilderElement } from '@builder.io/sdk';
import { style } from '../functions/style';
import { component } from '../constants/components';

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
  component: (block, jsxOptions, context) => {
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

    return `
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
          src="${options.image}"
          srcset="${useSrcSet}"
          sizes="${useSizes}"
          alt="${altText || ''}"
          ${style(
            {
              objectFit: backgroundSize || 'cover',
              objectPosition: backgroundPosition || 'center',
              ...(aspectRatio && {
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: '0',
                left: '0',
              }),
            },
            jsxOptions
          )} />`
        }
      </picture>
      ${
        aspectRatio
          ? `<div
          className="builder-image-sizer"
          ${style(
            {
              width: '100%',
              paddingTop: aspectRatio * 100 + '%',
              pointerEvents: 'none',
              fontSize: '0',
            },
            jsxOptions
          )}></div>`
          : ''
      }
      ${
        block.children && block.children.length
          ? `
        <div
          ${style(
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            },
            jsxOptions
          )}
        >
          ${block.children
            .map((block: BuilderElement, index: number) => blockToJsx(block, jsxOptions, context))
            .join('\n')}
        </div>`
          : ''
      }
`;
  },
});

import { blockToJsx } from '../../builder-to-jsx';
