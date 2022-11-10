import { curry } from 'lodash';
import { MitosisComponent } from '../../types/mitosis-component';
import { hasWatchHooks, renderWatchHooks } from './render-update-hooks';

function shouldRenderMountHook(json: MitosisComponent): boolean {
  return json.hooks.onMount !== undefined || hasWatchHooks(json);
}

export const renderMountHook = curry((json: MitosisComponent, objectString: string) => {
  return shouldRenderMountHook(json)
    ? objectString.replace(
        /(?:,)?(\s*)(}\s*)$/,
        `, init() {
      ${renderWatchHooks(json)}
      ${json.hooks.onMount?.code ?? ''}
    }$1$2`,
      )
    : objectString;
});
