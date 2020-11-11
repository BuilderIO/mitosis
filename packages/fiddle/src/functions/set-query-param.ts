export const setQueryParam = (name: string, value: string): void => {
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.set(name, value);
  const search = searchParams.toString();
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (search.length ? `?${search}` : ''),
  );
};
