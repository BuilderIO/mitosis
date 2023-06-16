import { BaseTranspilerOptions } from '../../types/transpiler';
import { getContextWithSymbolKey } from './helpers/context-with-symbol-key';

interface ContextToSvelteOptions extends Pick<BaseTranspilerOptions, 'prettier'> {}

/**
 * TO-DO: support types
 */
export const contextToSvelte = getContextWithSymbolKey;
