import { MitosisComponent, MitosisImport } from '../types/mitosis-component';

const getStarImport = (theImport: MitosisImport): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === '*') {
      return key;
    }
  }
  return null;
};
const getDefaultImport = (theImport: MitosisImport): string | null => {
  for (const key in theImport.imports) {
    const value = theImport.imports[key];
    if (value === 'default') {
      return key;
    }
  }
  return null;
};

export const renderImport = (theImport: MitosisImport): string => {
  let importString = 'import ';

  const starImport = getStarImport(theImport);
  if (starImport) {
    importString += ` * as ${starImport} `;
  } else {
    const defaultImport = getDefaultImport(theImport);

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

  importString += ` from '${theImport.path}';`;

  return importString;
};

export const renderImports = (imports: MitosisImport[]): string => {
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
    importString += renderImport(theImport) + '\n';
  }

  return importString;
};

export const renderPreComponent = (component: MitosisComponent): string => {
  return `
    ${renderImports(component.imports)}
    ${component.hooks.preComponent || ''}
  `;
};
