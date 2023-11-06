import { MitosisComponent } from '@/types/mitosis-component';

/**
 * Helper for frameworks where all `onMount()`s must share a single scope.
 */
export const stringifySingleScopeOnMount = (json: MitosisComponent) => {
  const hooks = json.hooks.onMount;

  if (hooks.length === 0) return '';

  if (hooks.length === 1) {
    return hooks[0].code;
  }

  return hooks
    .map((hook, i) => {
      const hookFnName = `onMountHook_${i}`;
      return `
    const ${hookFnName} = () => {
      ${hook.code}
    }
    ${hookFnName}();`;
    })
    .join('');
};
