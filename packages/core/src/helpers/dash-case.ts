export const dashCase = (string: string) =>
  string
    // Convert capitalis to dash - aka fooBar -> foo-bar
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
    // Convert all non alpha/number chars to dash - aka foo.bar -> foo-bar
    .replace(/[^a-z0-0]/gi, '-')
    // Final cleanup, if we're left within any -- (e.g. from multiple special chart)
    // convert it to one dash
    .replace(/[\-]{2,}/g, '-');
