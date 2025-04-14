import { format } from 'prettier/standalone';

export const tryFormat = (
  str: string,
  parser: string,
  htmlWhitespaceSensitivity: 'css' | 'strict' | 'ignore' = 'ignore',
) => {
  try {
    return format(str, {
      parser,
      plugins: [
        // To support running in browsers
        require('prettier/parser-typescript'),
        require('prettier/parser-postcss'),
        require('prettier/parser-html'),
        require('prettier/parser-babel'),
      ],
      htmlWhitespaceSensitivity,
    });
  } catch (err) {
    console.warn('Could not prettify', { string: str }, err);
  }
  return str;
};
