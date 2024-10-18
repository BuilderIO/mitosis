import { stringifyContextValue } from '@/helpers/get-state-object-string';
import { MitosisContext } from '@/types/mitosis-context';
import { BaseTranspilerOptions } from '@/types/transpiler';
import { format } from 'prettier/standalone';

interface ContextToSvelteOptions extends Pick<BaseTranspilerOptions, 'prettier'> {}

/**
 * TO-DO: support types
 */
export const contextToSvelte =
  (options: ContextToSvelteOptions) =>
  ({ context }: { context: MitosisContext }): string => {
    const isReactive = context.type === 'reactive';

    let str = `
const key = Symbol();  
${isReactive ? 'import {writable} from "svelte/store";' : ''}

export default {
  ${context.name}: ${[
      isReactive && 'writable(',
      stringifyContextValue(context.value),
      isReactive && ')',
    ]
      .filter(Boolean)
      .join('')}, 
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
        if (process.env.NODE_ENV !== 'test') {
          console.error('Format error for file:', str);
        }
        throw err;
      }
    }

    return str;
  };
