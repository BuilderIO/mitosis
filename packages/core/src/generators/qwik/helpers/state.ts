import { MitosisComponent } from '../../../types/mitosis-component';
import { File } from '../src-generator';

/**
 * @param file
 * @param stateInit
 */
export function emitUseStore({
  file,
  component,
  isDeep,
}: {
  file: File;
  component: MitosisComponent;
  isDeep?: boolean;
}) {
  const state = Object.entries(component.state).filter(([, value]) => value?.type === 'property');
  const hasState = state && Object.keys(state).length > 0;

  if (hasState) {
    file.src.emit('const state=', file.import(file.qwikModule, 'useStore').localName);
    if (file.options.isTypeScript) {
      file.src.emit('<any>');
    }

    file.src.emit('({');
    for (const [key, value] of state) {
      file.src.emit(`'${key}': ${value?.code!},`);
    }
    file.src.emit('}');

    if (isDeep) {
      file.src.emit(', {deep: true}');
    }
    file.src.emit(`);`);
  } else {
    // TODO hack for now so that `state` variable is defined, even though it is never read.
    file.src.emit(`const state${file.options.isTypeScript ? ': any' : ''} = {};`);
  }
}
