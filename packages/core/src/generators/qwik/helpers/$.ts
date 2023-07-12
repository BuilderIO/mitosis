import { convertTypeScriptToJS } from '../../../helpers/babel-transform';
import { MitosisComponent } from '../../../types/mitosis-component';
import { File } from '../src-generator';

/**
 * @param file
 * @param stateInit
 */
export function emitFunctions({ file, component }: { file: File; component: MitosisComponent }) {
  for (const key in component.state) {
    const stateValue = component.state[key];

    switch (stateValue?.type) {
      case 'method':
      case 'function':
        let code = stateValue.code;
        let prefixIdx = 0;
        if (stateValue.type === 'function') {
          prefixIdx += 'function '.length;
        }
        code = code.substring(prefixIdx);
        const functionName = code.split(/\(/)[0];
        if (!file.options.isTypeScript) {
          // Erase type information
          code = convertTypeScriptToJS(code);
        }

        // file.exportConst(functionName, 'function ' + code, true);
        const $Name = file.import(file.qwikModule, '$').localName;

        console.log('$$$:', { functionName, code });
        file.src.const(
          functionName,
          `${$Name}(${stateValue.type === 'method' ? 'function' : ''} ${stateValue.code})`,
        );
        continue;
    }
  }
}
