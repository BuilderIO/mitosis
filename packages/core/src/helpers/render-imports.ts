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

const transformImportPath = (theImport: MitosisImport, target?: Target) => {
  // We need to drop the `.lite` from context files, because the context generator does so as well.
  if (theImport.path.endsWith('.context.lite')) {
    return theImport.path.replace('.lite', '');
  }

  switch (target) {
    case 'svelte':
      if (theImport.path.endsWith('.lite'))
        // all svelte components have `.svelte` extension
        return theImport.path.replace('.lite', '.svelte');
      else {
        return theImport.path;
      }
    default:
      return theImport.path;
  }
};

const renderImport = ({
  theImport,
  target,
}: {
  theImport: MitosisImport;
  target?: Target;
}): string => {
  let importString = 'import ';

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

  const path = transformImportPath(theImport, target);

  importString += ` from '${path}';`;

  return importString;
};

const renderImports = ({
  imports,
  target,
}: {
  imports: MitosisImport[];
  target?: Target;
}): string => {
  let importString = '';

  for (const theImport of imports) {
    // Remove compile away components
    if (theImport.path === '@builder.io/components') {
      continue;
    }
    // TODO: Mitosis output needs this
    if (theImport.path.startsWith('@builder.io/mitosis')) {
      continue;
    }
    importString += renderImport({ theImport, target }) + '\n';
  }

  return importString;
};

export const renderPreComponent = (
  component: MitosisComponent,
  target?: Target,
): string => `
    ${renderImports({ imports: component.imports, target })}
    ${component.hooks.preComponent || ''}
  `;
