export type StripStateAndPropsRefsOptions = {
  replaceWith?: string | ((name: string) => string);
  includeProps?: boolean;
  includeState?: boolean;
  contextVars?: string[];
  outputVars?: string[];
  context?: string;
  domRefs?: string[];
};

const DEFAULT_OPTIONS: Required<StripStateAndPropsRefsOptions> = {
  replaceWith: '',
  contextVars: [],
  outputVars: [],
  context: 'this.',
  domRefs: [],
  includeProps: true,
  includeState: true,
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
  _options: StripStateAndPropsRefsOptions = {},
): string => {
  let newCode = code || '';

  const { replaceWith, contextVars, outputVars, context, domRefs, includeProps, includeState } = {
    ...DEFAULT_OPTIONS,
    ..._options,
  };

  contextVars.forEach((_var) => {
    newCode = newCode.replace(
      // determine expression edge cases - https://regex101.com/r/iNcTSM/1
      new RegExp('(^|\\n|\\r| |;|\\(|\\[|!)' + _var + '(\\?\\.|\\.|\\(| |;|\\)|$)', 'g'),
      '$1' + context + _var + '$2',
    );
  });

  outputVars.forEach((_var) => {
    // determine expression edge cases onMessage( to this.onMessage.emit(
    const regexp = '( |;|\\()(props\\.?)' + _var + '\\(';
    const replacer = '$1' + context + _var + '.emit(';
    newCode = newCode.replace(new RegExp(regexp, 'g'), replacer);
  });

  if (includeProps !== false) {
    if (typeof replaceWith === 'string') {
      newCode = newCode.replace(/props\./g, replaceWith);
    } else {
      newCode = newCode.replace(/props\.([\$a-z0-9_]+)/gi, (memo, name) => replaceWith(name));
    }
    // TODO: webcomponent edge-case
    if (/el\.this\.props/.test(newCode)) {
      newCode = newCode.replace(/el\.this\.props/g, 'el.props');
    }
  }
  if (includeState !== false) {
    if (typeof replaceWith === 'string') {
      newCode = newCode.replace(/state\./g, replaceWith);
    } else {
      newCode = newCode.replace(/state\.([\$a-z0-9_]+)/gi, (memo, name) => replaceWith(name));
    }
  }
  if (domRefs.length) {
    domRefs.forEach((_var) => {
      newCode = newCode.replace(
        // determine expression edge cases - https://regex101.com/r/iNcTSM/1
        new RegExp('(^|\\n|\\r| |;|\\(|\\[|!)' + _var + '(\\?\\.|\\.|\\(| |;|\\)|$)', 'g'),
        '$1' + 'this.' + _var + '$2',
      );
    });
  }
  return newCode;
};
