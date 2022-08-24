export const GETTER = /^get /;
export const SETTER = /^set /;

export const replaceGetterWithFunction = (str: string) => str.replace(/^(get )?/, 'function ');

export const prefixWithFunction = (str: string) => `function ${str}`;
