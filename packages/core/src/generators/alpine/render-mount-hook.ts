import { MitosisComponent } from '@/types/mitosis-component';
import { curry } from 'lodash';
import { stringifySingleScopeOnMount } from '../helpers/on-mount';
import { hasWatchHooks, renderWatchHooks } from './render-update-hooks';

function shouldRenderMountHook(json: MitosisComponent): boolean {
  return json.hooks.onMount.length > 0 || hasWatchHooks(json);
}

export const renderMountHook = curry((json: MitosisComponent, objectString: string) => {
  return shouldRenderMountHook(json)
    ? objectString.replace(
        /(?:,)?(\s*)(}\s*)$/,
        `, init() {
      ${renderWatchHooks(json)}
      ${stringifySingleScopeOnMount(json)}
    }$1$2`,
      )
    : objectString;
});
