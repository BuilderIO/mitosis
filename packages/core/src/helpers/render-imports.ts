import { Target } from '../types/config';
import { MitosisComponent, MitosisImport } from '../types/mitosis-component';

const getStarImport = ({
  theImport,
}: {
  theImport: MitosisImport;
}): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === '*') {
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
    if (value === 'default') {
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

const transformImportPath = (theImport: MitosisImport, target: Target) => {
  // We need to drop the `.lite` from context files, because the context generator does so as well.
  if (theImport.path.endsWith('.context.lite')) {
    return theImport.path.replace('.lite', '');
  }

  if (theImport.path.endsWith('.lite')) {
    return theImport.path.replace('.lite', getFileExtensionForTarget(target));
  }

  return theImport.path;
};

const getImportedValues = ({ theImport }: { theImport: MitosisImport }) => {
  let importString = '';

  const starImport = getStarImport({ theImport });
  if (starImport) {
    importString += ` * as ${starImport} `;
  } else {
    const defaultImport = getDefaultImport({ theImport });

    if (defaultImport) {
      importString += ` ${defaultImport}, `;
    }
    importString += ' { ';

    let firstAdded = false;
    for (const key in theImport.imports) {
      const value = theImport.imports[key];
      if (['default', '*'].includes(value!)) {
        continue;
      }
      if (firstAdded) {
        importString += ' , ';
      } else {
        firstAdded = true;
      }
      importString += ` ${value} `;

      if (key !== value) {
        importString += ` as ${key} `;
      }
    }
    importString += ' } ';
  }

  return importString;
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

  return `import ${importedValues} from '${path}';`;
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
