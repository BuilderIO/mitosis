import { decompressFromBase64 } from 'lz-string';

export const getQueryParam = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawValue = urlParams.get(name);
  const decompressedValue = rawValue && decompressFromBase64(rawValue);

  return decompressedValue ?? rawValue;
};
