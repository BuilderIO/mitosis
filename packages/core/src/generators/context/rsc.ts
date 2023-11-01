import { format } from 'prettier/standalone';
import { stringifyContextValue } from 'src/helpers/get-state-object-string';
import { MitosisContext } from 'src/types/mitosis-context';

type ContextToRscOptions = {
  format?: boolean;
};

/**
 * React Server Components currently do not support context, so we use
 * plain objects and prop drilling instead.
 */
export const contextToRsc =
  (options: ContextToRscOptions = {}) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
    export default ${stringifyContextValue(context.value)}
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
