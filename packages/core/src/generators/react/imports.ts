import { hasContext } from '../helpers/context';
import { MitosisComponent } from '@builder.io/mitosis';

export type ReactExports =
  | 'useState'
  | 'useRef'
  | 'useCallback'
  | 'useEffect'
  | 'useContext'
  | 'forwardRef';

interface getImportsGeneratorMeta {
  useStateCode: string;
  allRefs: string[];
  dontUseContext?: boolean;
}

export function getFrameworkImports(json: MitosisComponent, meta: getImportsGeneratorMeta) {
  const frameworkLibImports: Set<ReactExports> = new Set();
  if (meta.useStateCode.includes('useState')) {
    frameworkLibImports.add('useState');
  }
  if (hasContext(json) && !meta.dontUseContext) {
    frameworkLibImports.add('useContext');
  }
  if (meta.allRefs.length) {
    frameworkLibImports.add('useRef');
  }

  if (
    json.hooks.onMount?.code ||
    json.hooks.onUnMount?.code ||
    json.hooks.onUpdate?.length ||
    json.hooks.onInit?.code
  ) {
    frameworkLibImports.add('useEffect');
  }

  return frameworkLibImports;
}
