import { decompressFromBase64 } from 'lz-string';

export const getQueryParam = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedValue = urlParams.get(name);

  return decompressFromBase64(compressedValue);
};
