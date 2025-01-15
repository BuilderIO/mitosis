export const getFunctionString = (code: string): string =>
  code.startsWith('function') ? code : `function ${code}`;