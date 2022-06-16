import { Target } from '../types/config';
import { MitosisComponent, MitosisImport } from '../types/mitosis-component';

const DEFAULT_IMPORT = 'default';
const STAR_IMPORT = '*';

const getStarImport = ({
  theImport,
}: {
  theImport: MitosisImport;
}): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === STAR_IMPORT) {
      return key;
    }
  }
  return null;
};
const getDefaultImport = ({
  theImport,
}: {
  theImport: MitosisImport;
}): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === DEFAULT_IMPORT) {
      return key;
    }
  }
  return null;
};

const getFileExtensionForTarget = (target: Target) => {
  switch (target) {
    case 'svelte':
      return '.svelte';
    case 'solid':
      return '.jsx';
    case 'vue':
      return '.vue';
    // these `.lite` extensions are handled in the `transpile` step of the CLI.
    // TO-DO: consolidate file-extension renaming to one place.
    default:
      return '.lite';
  }
};

const checkIsComponentImport = (theImport: MitosisImport) =>
  theImport.path.endsWith('.lite') && !theImport.path.endsWith('.context.lite');

const transformImportPath = (theImport: MitosisImport, target: Target) => {
  // We need to drop the `.lite` from context files, because the context generator does so as well.
  if (theImport.path.endsWith('.context.lite')) {
    return theImport.path.replace('.lite', '');
  }

  if (checkIsComponentImport(theImport)) {
    return theImport.path.replace('.lite', getFileExtensionForTarget(target));
  }

  return theImport.path;
};

const getNamedImports = ({ theImport }: { theImport: MitosisImport }) => {
  const namedImports = Object.entries(theImport.imports)
    .filter(([, value]) => ![DEFAULT_IMPORT, STAR_IMPORT].includes(value!))
    .map(([key, value]) => {
      return key !== value ? `${value} as ${key}` : value;
    });

  if (namedImports.length > 0) {
    return `{ ${namedImports.join(', ')} }`;
  } else {
    return null;
  }
};

interface ImportValues {
  starImport: string | null;
  defaultImport: string | null;
  namedImports: string | null;
}

const getImportedValues = ({
  theImport,
}: {
  theImport: MitosisImport;
}): ImportValues => {
  const starImport = getStarImport({ theImport });
  const defaultImport = getDefaultImport({ theImport });
  const namedImports = getNamedImports({ theImport });

  return { starImport, defaultImport, namedImports };
};

const getImportValue = ({
  defaultImport,
  namedImports,
  starImport,
}: ImportValues) => {
  if (starImport) {
    return ` * as ${starImport} `;
  } else {
    return [defaultImport, namedImports].filter(Boolean).join(', ');
  }
};

export const renderImport = ({
  theImport,
  target,
}: {
  theImport: MitosisImport;
  target: Target;
}): string => {
  const importedValues = getImportedValues({ theImport });
  const path = transformImportPath(theImport, target);
  const importValue = getImportValue(importedValues);

  const isComponentImport = checkIsComponentImport(theImport);
  // TO-DO: make async Vue imports optional via CLI config
  const isVueImport = target === 'vue';
  const shouldBeAsyncImport = isComponentImport && isVueImport;

  if (shouldBeAsyncImport) {
    if (importedValues.namedImports) {
      console.warn(
        'Vue: Component imports with named imports is not supported, due to async components. Dropping named imports',
      );
    } else {
      return `const ${importValue} = () => import('${path}')`;
    }
  }

  return `import ${importValue} from '${path}';`;
};

export const renderImports = ({
  imports,
  target,
}: {
  imports: MitosisImport[];
  target: Target;
}): string =>
  imports
    .filter((theImport) => {
      if (
        // Remove compile away components
        theImport.path === '@builder.io/components' ||
        // TODO: Mitosis output needs this
        theImport.path.startsWith('@builder.io/mitosis')
      ) {
        return false;
      } else {
        return true;
      }
    })
    .map((theImport) => renderImport({ theImport, target }))
    .join('\n');

export const renderPreComponent = (
  component: MitosisComponent,
  target: Target,
): string => `
    ${renderImports({ imports: component.imports, target })}
    ${renderExportAndLocal(component)}
    ${component.hooks.preComponent || ''}
  `;

export const renderExportAndLocal = (component: MitosisComponent): string => {
  return Object.keys(component.exports || {})
    .map((key) => component.exports![key].code)
    .join('\n');
};
