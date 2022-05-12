export type StripStateAndPropsRefsOptions = {
  replaceWith?: string | ((name: string) => string);
  includeProps?: boolean;
  includeState?: boolean;
  contextVars?: string[];
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
): string => {
  let newCode = code || '';
  const replacer = options.replaceWith || '';
  const contextVars = options.contextVars || [];

  if (options.includeProps !== false) {
    if (typeof replacer === 'string') {
      newCode = newCode.replace(/props\./g, replacer);
    } else {
      newCode = newCode.replace(/props\.([\$a-z0-9_]+)/gi, (memo, name) =>
        replacer(name),
      );
    }
  }
  if (options.includeState !== false) {
    if (typeof replacer === 'string') {
      newCode = newCode.replace(/state\./g, replacer);
    } else {
      newCode = newCode.replace(/state\.([\$a-z0-9_]+)/gi, (memo, name) =>
        replacer(name),
      );
    }
  }
  if (contextVars.length) {
    contextVars.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases
        new RegExp('( |;|(\\())' + _var, 'g'),
        '$2this.' + _var,
      );
    });
  }
  return newCode;
};
