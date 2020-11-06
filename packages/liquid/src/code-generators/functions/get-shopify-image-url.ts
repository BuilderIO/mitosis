import { parse } from 'url';

// Taken from (and modified) the shopify theme script repo
// https://github.com/Shopify/theme-scripts/blob/bcfb471f2a57d439e2f964a1bb65b67708cc90c3/packages/theme-images/images.js#L59
export const getShopifyImageUrl = (src: string, size: string) => {
  if (!src || !src?.match(/cdn\.shopify\.com/) || !size) {
    return src;
  }

  const parsedSrc = parse(src, false, true);

  if (size === 'master') {
    return `//${parsedSrc.hostname}${parsedSrc.path}`;
  }

  const match = parsedSrc.pathname?.match(
    /(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif))$/i
  );

  if (match && parsedSrc.pathname) {
    const originalNoSizePath = parsedSrc.pathname.split(match[0])[0];
    const suffix = match[3];
    const useSize = size.match('x') ? size : `${size}x`;

    return `//${parsedSrc.hostname}${originalNoSizePath}_${useSize}${suffix}${
      parsedSrc.search || ''
    }`;
  }

  return src;
};
