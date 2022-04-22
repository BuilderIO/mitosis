import { format } from 'prettier/standalone';
import { getMemberObjectString } from '../../helpers/get-state-object-string';
import { MitosisContext } from '../../types/mitosis-context';

type ContextToSvelteOptions = {
  format?: boolean;
};

export const contextToSvelte =
  (options: ContextToSvelteOptions = {}) =>
  ({ context }: { context: MitosisContext }): string => {
    let str = `
  const key = Symbol();  

  export default {
    ${context.name}: ${getMemberObjectString(context.value)}, 
    key 
  }
  `;

    console.log('generated context svelte: ', str);

    // if (options.format !== false) {
    //   try {
    //     str = format(str, {
    //       parser: 'typescript',
    //       plugins: [
    //         require('prettier/parser-typescript'), // To support running in browsers
    //       ],
    //     });
    //   } catch (err) {
    //     console.error('Format error for file:', str);
    //     throw err;
    //   }
    // }

    return str;
  };
