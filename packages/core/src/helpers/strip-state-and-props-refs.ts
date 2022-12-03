import { replaceIdentifiers } from './replace-identifiers';

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

const DEFAULT_OPTIONS: Required<StripStateAndPropsRefsOptions> = {
  replaceWith: '',
  contextVars: [],
  outputVars: [],
  stateVars: [],
  context: 'this.',
  domRefs: [],
  includeProps: true,
  includeState: true,
};

/**
 * Remove state. and props. from expressions, e.g.
 * state.foo -> foo
 *
 * This is for support for frameworks like Vue, Svelte, liquid, etc
 *
 */
export const stripStateAndPropsRefs = (
  code?: string,
  _options: StripStateAndPropsRefsOptions = {},
): string => {
  let newCode = code || '';

  const {
    replaceWith,
    contextVars,
    outputVars,
    context,
    domRefs,
    includeProps,
    includeState,
    stateVars,
  } = {
    ...DEFAULT_OPTIONS,
    ..._options,
  };

  contextVars?.forEach((_var) => {
    newCode = newCode.replace(
      // determine expression edge cases - https://regex101.com/r/iNcTSM/1
      new RegExp('(^|\\n|\\r| |;|\\(|\\[|!)' + _var + '(\\?\\.|\\.|\\(| |;|\\)|$)', 'g'),
      '$1' + context + _var + '$2',
    );
  });

  outputVars?.forEach((_var) => {
    // determine expression edge cases onMessage( to this.onMessage.emit(
    const regexp = '(^|\\s|;|\\()(props\\.?)' + _var + '\\(';
    const replacer = '$1' + context + _var + '.emit(';
    newCode = newCode.replace(new RegExp(regexp, 'g'), replacer);
  });

  if (includeProps !== false) {
    newCode = replaceIdentifiers({ code: newCode, from: 'props', to: replaceWith || null });

    // TODO: webcomponent edge-case
    if (/el\.this\.props/.test(newCode)) {
      newCode = newCode.replace(/el\.this\.props/g, 'el.props');
    }
  }
  if (includeState !== false) {
    newCode = replaceIdentifiers({ code: newCode, from: 'state', to: replaceWith || null });
  }

  const matchPropertyAccessorsArguments = '\\?\\.|,|\\.|\\(| |;|\\)|\\]|$'; // foo?.stuff | foo) | foo | foo] etc.
  const matchVariableUseInClass = '^|\\n|\\r| |;|\\(|\\[|!|,'; //  foo | (foo | !foo | foo, | [foo etc.

  domRefs?.forEach((_var) => {
    newCode = newCode.replace(
      new RegExp(`(${matchVariableUseInClass})${_var}(${matchPropertyAccessorsArguments})`, 'g'),
      '$1' + 'this.' + _var + '$2',
    );
  });

  stateVars?.forEach((_var) => {
    newCode = newCode.replace(
      /*
          1. Skip anything that is a class variable declaration
             myClass() {
              stuff = 'hi'
               foo = 'bar'  <-- in the event that formatting is off
             }
          2. Skip anything that is the name of a function declaration or a getter
             stuff = function stuff() {}  or  get stuff
          3. If the conditions are met then try to match all use cases of the class variables, see above.
        */
      new RegExp(
        `(?!^${_var}|^ ${_var})(?<!function|get)(${matchVariableUseInClass})${_var}(${matchPropertyAccessorsArguments})`,
        'g',
      ),
      '$1' + 'this.' + _var + '$2',
    );
  });
  return newCode;
};
