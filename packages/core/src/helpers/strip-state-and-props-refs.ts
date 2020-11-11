/**
 * Remove state. and props. from expressions, e.g.
 * state.foo -> foo
 *
 * This is for support for frameworks like Vue, Svelte, liquid,  etc
 */
export const stripStateAndPropsRefs = (code?: string, replaceWith = '') => {
  // TODO: babel transform
  // TODO: support replaceWith to provide things like `this` instead
  return (code || '').replace(/state\./g, '').replace(/props\./g, '');
};
