import { replacePropsIdentifier, replaceStateIdentifier } from './replace-identifiers';

export type StripStateAndPropsRefsOptions = {
  replaceWith?: string | ((name: string) => string);
  includeProps?: boolean;
  includeState?: boolean;
};

const DEFAULT_OPTIONS: Required<StripStateAndPropsRefsOptions> = {
  replaceWith: '',
  includeProps: true,
  includeState: true,
};

/**
 * Do not use this anywhere. We are migrating to AST transforms and should avoid Regex String.replace() as they are
 * very brittle.
 *
 * If you need to re-use this, re-create it as an AST tranform first.
 */
export const DO_NOT_USE_CONTEXT_VARS_TRANSFORMS = ({
  code,
  contextVars,
  context,
}: {
  code: string;
  contextVars?: string[];
  context: string;
}): string => {
  contextVars?.forEach((_var) => {
    code = code.replace(
      // determine expression edge cases - https://regex101.com/r/iNcTSM/1
      new RegExp('(^|\\n|\\r| |;|\\(|\\[|!)' + _var + '(\\?\\.|\\.|\\(| |;|\\)|$)', 'g'),
      '$1' + context + _var + '$2',
    );
  });
  return code;
};

export type DO_NOT_USE_ARGS = {
  outputVars?: string[];
  domRefs?: string[];
  stateVars?: string[];
  contextVars?: string[];
  context?: string;
};

/**
 * Do not use these anywhere. We are migrating to AST transforms and should avoid Regex String.replace() as they are
 * very brittle.
 *
 * If you need to re-use a part of this, re-create it as an AST tranform first.
 */
export const DO_NOT_USE_VARS_TRANSFORMS = (
  newCode: string,
  { context = 'this.', domRefs, outputVars, stateVars, contextVars }: DO_NOT_USE_ARGS,
): string => {
  newCode = DO_NOT_USE_CONTEXT_VARS_TRANSFORMS({ code: newCode, context, contextVars });

  outputVars?.forEach((_var) => {
    // determine expression edge cases onMessage( to this.onMessage.emit(
    const regexp = '(^|\\s|;|\\()(props\\.?)' + _var + '\\(';
    const replacer = '$1' + context + _var + '.emit(';
    newCode = newCode.replace(new RegExp(regexp, 'g'), replacer);
  });

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

  const { replaceWith, includeProps, includeState } = {
    ...DEFAULT_OPTIONS,
    ..._options,
  };

  if (includeProps) {
    newCode = replacePropsIdentifier(replaceWith)(newCode);

    // TODO: webcomponent edge-case
    if (/el\.this\.props/.test(newCode)) {
      newCode = newCode.replace(/el\.this\.props/g, 'el.props');
    }
  }
  if (includeState) {
    newCode = replaceStateIdentifier(replaceWith)(newCode);
  }

  return newCode;
};
