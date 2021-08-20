import { MitosisContext } from '../../types/mitosis-context';

type ContextToVueOptions = {
  format?: boolean;
};

export function contextToVue(
  context: MitosisContext,
  options: ContextToVueOptions = {},
): string {
  let str = `
    // Noop file
    export default {};
  `;

  return str;
}
