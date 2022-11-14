import type { SveltosisComponent } from '../types';

export function addToOnInitHook(json: SveltosisComponent, code: string) {
  if (json.hooks.onInit?.code.length) {
    json.hooks.onInit.code += `\n ${code}`;
  } else {
    json.hooks.onInit = {
      code,
    };
  }
}
