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

  const path =
    target === 'svelte' && theImport.path.endsWith('.lite')
      ? theImport.path.replace('.lite', '.svelte')
      : theImport.path;

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
