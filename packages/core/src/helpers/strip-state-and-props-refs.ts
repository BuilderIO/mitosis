export type StripStateAndPropsRefsOptions = {
  replaceWith?: string | ((name: string) => string);
  includeProps?: boolean;
  includeState?: boolean;
  contextVars?: string[];
  outputVars?: string[];
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
  const contextVars = options?.contextVars || [];
  const outputVars = options?.outputVars || [];
  if (contextVars.length) {
    contextVars.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases
        new RegExp('( |;|(\\())' + _var, 'g'),
        '$1this.' + _var,
      );
    });
  }
  if (outputVars.length) {
    outputVars.forEach((_var) => {
      // determine expression edge cases onMessage( to this.onMessage.emit(
      const regexp = '( |;|\\()(props\\.?)' + _var + '\\(';
      const replacer = '$1this.' + _var + '.emit(';
      newCode = newCode.replace(new RegExp(regexp, 'g'), replacer);
    });
  }
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
  return newCode;
};
