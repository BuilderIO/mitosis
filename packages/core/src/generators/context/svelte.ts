import { format } from 'prettier/standalone';
import { stringifyContextValue } from '../../helpers/get-state-object-string';
import { MitosisContext } from '../../types/mitosis-context';
import { BaseTranspilerOptions } from '../../types/transpiler';

interface ContextToSvelteOptions extends Pick<BaseTranspilerOptions, 'prettier'> {}

/**
 * TO-DO: support types
 */
export const contextToSvelte =
  (options: ContextToSvelteOptions = {}) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
  const key = Symbol();  

  export default {
    ${context.name}: ${stringifyContextValue(context.value)}, 
    key 
  }
  `;

    if (options.prettier !== false) {
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
