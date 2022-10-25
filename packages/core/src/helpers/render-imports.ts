import { components } from '..';
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
    // TO-DO: consolidate file-extension renaming to this file, and remove `.lite` replaces from the CLI `transpile`. (outdated) ?
    // Bit team wanted to make sure React and Angular behaved the same in regards to imports - ALU 10/05/22
    default:
      return '.lite';
  }
};

export const checkIsComponentImport = (theImport: MitosisImport) =>
  theImport.path.endsWith('.lite') && !theImport.path.endsWith('.context.lite');

const transformImportPath = (
  theImport: MitosisImport,
  target: Target,
  preserveFileExtensions: boolean,
  componentsUsed?: string[],
  addFrameworkPathToImport?: string,
) => {
  // 'my-path' becomes 'my-path/angular'
  if (target === 'angular') {
    for (const componentName of componentsUsed || []) {
      if (theImport.imports[componentName]) {
        return theImport.path + addFrameworkPathToImport;
      }
    }
  }
  // We need to drop the `.lite` from context files, because the context generator does so as well.
  if (theImport.path.endsWith('.context.lite')) {
    return theImport.path.replace('.lite', '.js');
  }

  if (checkIsComponentImport(theImport) && !preserveFileExtensions) {
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

const getImportValue = (
  { defaultImport, namedImports, starImport }: ImportValues,
  target: Target,
  componentsUsed: string[],
) => {
  if (target === 'angular') {
    return [defaultImport, namedImports]
      .filter(Boolean)
      .map((importName) => {
        for (const usedComponentName of componentsUsed || []) {
          if ((importName || '').indexOf(usedComponentName) > -1) {
            return (importName || '').replace(usedComponentName, `${usedComponentName}Module`);
          }
        }
        return importName;
      })
      .join(', ');
  }

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
  preserveFileExtensions = false,
  componentsUsed = [],
  addFrameworkPathToImport,
}: {
  theImport: MitosisImport;
  target: Target;
  asyncComponentImports: boolean;
  preserveFileExtensions?: boolean;
  componentsUsed?: string[];
  addFrameworkPathToImport?: string;
}): string => {
  const importedValues = getImportedValues({ theImport });

  const path = transformImportPath(
    theImport,
    target,
    preserveFileExtensions,
    componentsUsed,
    addFrameworkPathToImport,
  );
  const importValue = getImportValue(importedValues, target, componentsUsed);

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
      return `const ${importValue} = () => import('${path}')
      .then(x => x.default)
      .catch(err => { 
        console.error('Error while attempting to dynamically import component ${importValue} at ${path}', err);
        throw err;
      });`;
    }
  }

  return importValue ? `import ${importValue} from '${path}';` : `import '${path}';`;
};

export const renderImports = ({
  imports,
  target,
  asyncComponentImports,
  excludeMitosisComponents,
  preserveFileExtensions = false,
  componentsUsed,
  addFrameworkPathToImport,
}: {
  imports: MitosisImport[];
  target: Target;
  asyncComponentImports: boolean;
  excludeMitosisComponents?: boolean;
  preserveFileExtensions?: boolean;
  componentsUsed?: string[];
  addFrameworkPathToImport?: string;
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
    .map((theImport) =>
      renderImport({
        theImport,
        target,
        asyncComponentImports,
        preserveFileExtensions,
        componentsUsed,
        addFrameworkPathToImport,
      }),
    )
    .join('\n');

export const renderPreComponent = ({
  component,
  target,
  excludeMitosisComponents,
  asyncComponentImports = false,
  preserveFileExtensions = false,
  componentsUsed = [],
  addFrameworkPathToImport = '',
}: {
  component: MitosisComponent;
  target: Target;
  asyncComponentImports?: boolean;
  excludeMitosisComponents?: boolean;
  preserveFileExtensions?: boolean;
  componentsUsed?: string[];
  addFrameworkPathToImport?: string;
}): string => `
    ${renderImports({
      imports: component.imports,
      target,
      asyncComponentImports,
      excludeMitosisComponents,
      preserveFileExtensions,
      componentsUsed,
      addFrameworkPathToImport,
    })}
    ${renderExportAndLocal(component)}
    ${component.hooks.preComponent?.code || ''}
  `;

export const renderExportAndLocal = (component: MitosisComponent): string => {
  return Object.keys(component.exports || {})
    .map((key) => component.exports![key].code)
    .join('\n');
};
