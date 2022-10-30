import { curry } from 'lodash';
import { MitosisComponent } from '../../types/mitosis-component';

export const renderMountHook = curry((json: MitosisComponent, objectString: string) => {
  return json.hooks.onMount
    ? objectString.replace(/(?:,)?(\s*)(}\s*)$/, `, init() {${json.hooks.onMount?.code}}$1$2`)
    : objectString;
});
