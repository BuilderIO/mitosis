import { MitosisContext } from '../types/mitosis-context';

export function createMitosisContext(
  options: Partial<MitosisContext> & { name: string },
): MitosisContext {
  return {
    '@type': '@builder.io/mitosis/context',
    value: {},
    ...options,
  };
}
