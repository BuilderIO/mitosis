import { format } from 'prettier/standalone';
import { MitosisContext } from '../../types/mitosis-context';

type ContextToQwikOptions = {
  format?: boolean;
};

export const contextToQwik =
  (options: ContextToQwikOptions = {}) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
  import { createContext } from '@builder.io/qwik';

  export default createContext<any>("${context.name}")
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
  };
