import { decompressFromBase64 } from 'lz-string';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export const getQueryParam = (name: string): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const rawValue = urlParams.get(name);
  const decompressedValue = rawValue && decompressFromBase64(rawValue);

  return decompressedValue ?? rawValue;
};
