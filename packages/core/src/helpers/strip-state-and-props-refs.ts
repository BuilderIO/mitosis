export type StripStateAndPropsRefsOptions = {
  replaceWith?: string;
  includeProps?: boolean;
  includeState?: boolean;
};

/**
 * Remove state. and props. from expressions, e.g.
 * state.foo -> foo
 *
 * This is for support for frameworks like Vue, Svelte, liquid,  etc
 *
 * @todo proper ref replacement with babel
 */
export const stripStateAndPropsRefs = (
  code?: string,
  options: StripStateAndPropsRefsOptions = {},
) => {
  let newCode = code || '';
  const replaceStr = options.replaceWith || '';

  if (options.includeProps !== false) {
    newCode = newCode.replace(/props\./g, replaceStr);
  }
  if (options.includeState !== false) {
    newCode = newCode.replace(/state\./g, replaceStr);
  }

  return newCode;
};
