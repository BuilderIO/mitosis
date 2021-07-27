import { format } from 'prettier/standalone';
import { getMemberObjectString } from '../../helpers/get-state-object-string';
import { JSXLiteContext } from '../../types/jsx-lite-context';

type ContextToReactOptions = {
  format?: boolean;
};

export function contextToReact(
  context: JSXLiteContext,
  options: ContextToReactOptions = {},
): string {
  let str = `
  import { createContext } from 'react';

  export default createContext(${getMemberObjectString(context.members)})
  `;

  if (options.format !== false) {
    try {
      str = format(str, {
        parser: 'typescript',
        plugins: [
          require('prettier/parser-typescript'), // To support running in browsers
        ],
      });
    } catch (err) {
      console.error('Format error for file:', str);
      throw err;
    }
  }

  return str;
}
