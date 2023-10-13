import { compressToBase64 } from 'lz-string';

export const setQueryParam = (name: string, value: string): void => {
  var searchParams = new URLSearchParams(window.location.search);
  const compressedValue = compressToBase64(value);
  searchParams.set(name, compressedValue);
  const search = searchParams.toString();
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (search.length ? `?${search}` : ''),
  );
};
