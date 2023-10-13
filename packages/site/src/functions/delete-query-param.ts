export const deleteQueryParam = (name: string): void => {
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.delete(name);
  const search = searchParams.toString();
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (search.length ? `?${search}` : ''),
  );
};
