import { Target } from '../types/config';
import { MitosisComponent, MitosisImport } from '../types/mitosis-component';

const DEFAULT_IMPORT = 'default';
const STAR_IMPORT = '*';

const getStarImport = ({ theImport }: { theImport: MitosisImport }): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === STAR_IMPORT) {
      return key;
    }
  }
  return null;
};
const getDefaultImport = ({ theImport }: { theImport: MitosisImport }): string | null => {
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
    case 'vue2':
    case 'vue3':
      return '.vue';
    case 'marko':
      return '.marko';
    case 'lit':
      return '.js';
    case 'angular':
      return '';
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
    return theImport.path.replace('.lite', '.js');
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

const getImportedValues = ({ theImport }: { theImport: MitosisImport }): ImportValues => {
  const starImport = getStarImport({ theImport });
  const defaultImport = getDefaultImport({ theImport });
  const namedImports = getNamedImports({ theImport });

  return { starImport, defaultImport, namedImports };
};

const getImportValue = ({ defaultImport, namedImports, starImport }: ImportValues) => {
  if (starImport) {
    return ` * as ${starImport} `;
  } else {
    return [defaultImport, namedImports].filter(Boolean).join(', ');
  }
};

export const renderImport = ({
  theImport,
  target,
  asyncComponentImports,
}: {
  theImport: MitosisImport;
  target: Target;
  asyncComponentImports: boolean;
}): string => {
  const importedValues = getImportedValues({ theImport });
  const path = transformImportPath(theImport, target);
  const importValue = getImportValue(importedValues);

  const isComponentImport = checkIsComponentImport(theImport);
  const shouldBeAsyncImport = asyncComponentImports && isComponentImport;

  // For lit (components) we just want to do a plain import
  // https://lit.dev/docs/components/rendering/#composing-templates
  if (isComponentImport && target === 'lit') {
    return `import '${path}';`;
  }

  if (shouldBeAsyncImport) {
    const isVueImport = target === 'vue';
    if (isVueImport && importedValues.namedImports) {
      console.warn(
        'Vue: Async Component imports cannot include named imports. Dropping async import. This might break your code.',
      );
    } else {
      return `const ${importValue} = () => import('${path}')`;
    }
  }

  return importValue ? `import ${importValue} from '${path}';` : `import '${path}';`;
};

export const renderImports = ({
  imports,
  target,
  asyncComponentImports,
  excludeMitosisComponents,
}: {
  imports: MitosisImport[];
  target: Target;
  asyncComponentImports: boolean;
  excludeMitosisComponents?: boolean;
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
      } else if (excludeMitosisComponents && theImport.path.includes('.lite')) {
        return false;
      } else {
        return true;
      }
    })
    .map((theImport) => renderImport({ theImport, target, asyncComponentImports }))
    .join('\n');

export const renderPreComponent = ({
  component,
  target,
  excludeMitosisComponents,
  asyncComponentImports = false,
}: {
  component: MitosisComponent;
  target: Target;
  asyncComponentImports?: boolean;
  excludeMitosisComponents?: boolean;
}): string => `
    ${renderImports({
      imports: component.imports,
      target,
      asyncComponentImports,
      excludeMitosisComponents,
    })}
    ${renderExportAndLocal(component)}
    ${component.hooks.preComponent || ''}
  `;

export const renderExportAndLocal = (component: MitosisComponent): string => {
  return Object.keys(component.exports || {})
    .map((key) => component.exports![key].code)
    .join('\n');
};
