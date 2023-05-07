import { format } from 'prettier/standalone';
import { stringifyContextValue } from '../../helpers/get-state-object-string';
import { MitosisContext } from '../../types/mitosis-context';

type ContextToPreactOptions = {
  format?: boolean;
  typescript?: boolean;
};

export const contextToPreact =
  (options: ContextToPreactOptions = { typescript: false }) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
  import { createContext } from 'preact';

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
        console.error('Format error for file:', str);
        throw err;
      }
    }

    return str;
  };
