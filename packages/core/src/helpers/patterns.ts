export const GETTER = /^\s*get /;
export const SETTER = /^\s*set /;

export const checkIsGetter = (code: string) => code.match(GETTER);
export const stripGetter = (str: string) => str.replace(GETTER, '');

export const replaceGetterWithFunction = (str: string) => str.replace(/^(get )?/, 'function ');
export const replaceFunctionWithGetter = (str: string) => str.replace(/^(function )?/, 'get ');

export const extractGetterCodeBlock = (getter: string) =>
  getter.replace(/[\S\s]*\(\) \{([\S\s]*)\}[\S\s]*/, '$1').trim();

export const prefixWithFunction = (str: string) => `function ${str}`;
