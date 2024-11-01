import { stringifyContextValue } from '@/helpers/get-state-object-string';
import { MitosisContext } from '@/types/mitosis-context';
import { format } from 'prettier/standalone';

type ContextToReactOptions = {
  format?: boolean;
  preact?: boolean;
  typescript?: boolean;
};

export const contextToReact =
  (options: ContextToReactOptions = { typescript: false, preact: false }) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
  import { createContext } from '${options.preact ? 'preact' : 'react'}';

  export default createContext${options.typescript ? '<any>' : ''}(${stringifyContextValue(
      context.value,
    )})
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
        if (process.env.NODE_ENV !== 'test') {
          console.error('Format error for file:', str);
        }
        throw err;
      }
    }

    return str;
  };
