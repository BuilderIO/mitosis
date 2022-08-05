export type StripStateAndPropsRefsOptions = {
  replaceWith?: string | ((name: string) => string);
  includeProps?: boolean;
  includeState?: boolean;
  contextVars?: string[];
  outputVars?: string[];
  stateVars?: string[];
  context?: string;
  domRefs?: string[];
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
  const context = options?.context || 'this.';
  const domRefs = options?.domRefs || [];
  const stateVars = options?.stateVars || [];

  if (contextVars.length) {
    contextVars.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases - https://regex101.com/r/iNcTSM/1
        new RegExp('(^|\\n|\\r| |;|\\(|\\[|!)' + _var + '(\\?\\.|\\.|\\(| |;|\\)|$)', 'g'),
        '$1' + context + _var + '$2',
      );
    });
  }
  if (outputVars.length) {
    outputVars.forEach((_var) => {
      // determine expression edge cases onMessage( to this.onMessage.emit(
      const regexp = '( |;|\\()(props\\.?)' + _var + '\\(';
      const replacer = '$1' + context + _var + '.emit(';
      newCode = newCode.replace(new RegExp(regexp, 'g'), replacer);
    });
  }
  if (options.includeProps !== false) {
    if (typeof replacer === 'string') {
      newCode = newCode.replace(/props\./g, replacer);
    } else {
      newCode = newCode.replace(/props\.([\$a-z0-9_]+)/gi, (memo, name) => replacer(name));
    }
    // TODO: webcomponent edge-case
    if (/el\.this\.props/.test(newCode)) {
      newCode = newCode.replace(/el\.this\.props/g, 'el.props');
    }
  }
  if (options.includeState !== false) {
    if (typeof replacer === 'string') {
      newCode = newCode.replace(/state\./g, replacer);
    } else {
      newCode = newCode.replace(/state\.([\$a-z0-9_]+)/gi, (memo, name) => replacer(name));
    }
  }
  if (domRefs.length) {
    domRefs.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases - https://regex101.com/r/iNcTSM/1
        new RegExp('(^|\\n|\\r| |;|\\(|\\[|!|,)' + _var + '(\\?\\.|,|\\.|\\(| |;|\\)|\\]|$)', 'g'),
        '$1' + 'this.' + _var + '$2',
      );
    });
  }
  if (stateVars.length) {
    stateVars.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases - https://regex101.com/r/iNcTSM/1
        new RegExp(
          `(?!^${_var}|^ ${_var})(?<!function|get)(^|\\n|\\r| |;|\\(|\\[|!|,)${_var}(\\?\\.|,|\\.|\\(| |;|\\)|\\]|$)`,
          'g',
        ),
        '$1' + 'this.' + _var + '$2',
      );
    });
  }
  return newCode;
};
