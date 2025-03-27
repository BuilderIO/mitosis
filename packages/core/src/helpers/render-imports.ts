import { Target } from '../types/config';
import { MitosisComponent, MitosisImport } from '../types/mitosis-component';
import {
  COMPONENT_IMPORT_EXTENSIONS,
  INPUT_EXTENSION_REGEX,
  getComponentFileExtensionForTarget,
} from './component-file-extensions';

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

const CONTEXT_IMPORTS = ['context.lite', 'context.lite.ts', 'context.lite.js'];
const checkIsContextImport = (theImport: MitosisImport) =>
  CONTEXT_IMPORTS.some((contextPath) => theImport.path.endsWith(contextPath));

export const checkIsComponentImport = (theImport: MitosisImport) =>
  !checkIsContextImport(theImport) &&
  COMPONENT_IMPORT_EXTENSIONS.some((contextPath) => theImport.path.endsWith(contextPath));

export const transformImportPath = ({
  theImport,
  target,
  preserveFileExtensions,
  explicitImportFileExtension,
}: {
  theImport: MitosisImport;
  target: Target;
  preserveFileExtensions: boolean;
  explicitImportFileExtension: boolean;
}) => {
  // We need to drop the `.lite` from context files, because the context generator does so as well.
  if (checkIsContextImport(theImport)) {
    let path = theImport.path;
    CONTEXT_IMPORTS.forEach((contextPath) => {
      if (path.endsWith(contextPath)) {
        path = path.replace(contextPath, 'context.js');
      }
    });
    return path;
  }

  if (preserveFileExtensions) return theImport.path;

  if (checkIsComponentImport(theImport)) {
    return theImport.path.replace(
      INPUT_EXTENSION_REGEX,
      getComponentFileExtensionForTarget({ target, type: 'import', explicitImportFileExtension }),
    );
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

export interface ImportValues {
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

type ImportArgs = {
  target: Target;
  asyncComponentImports: boolean;
  preserveFileExtensions?: boolean;
  component?: MitosisComponent | null | undefined;

  /**
   * This is only used by Angular generator, and will be deprecated in the future.
   */
  importMapper?: Function | null | undefined;
  /**
   * This is only used by Angular generator, and will be deprecated in the future.
   */
  explicitImportFileExtension?: boolean;
  /**
   * This is only used by Angular generator, and will be deprecated in the future.
   */
  componentsUsed?: string[];
};

export const renderImport = ({
  theImport,
  target,
  asyncComponentImports,
  preserveFileExtensions = false,
  component = undefined,
  componentsUsed = [],
  importMapper,
  explicitImportFileExtension = false,
}: ImportArgs & { theImport: MitosisImport }): string => {
  const importedValues = getImportedValues({ theImport });

  const path = transformImportPath({
    theImport,
    target,
    preserveFileExtensions,
    explicitImportFileExtension,
  });
  const importValue = getImportValue(importedValues);

  const isComponentImport = checkIsComponentImport(theImport);
  const shouldBeAsyncImport = asyncComponentImports && isComponentImport;
  const isTypeImport = theImport.importKind === 'type';

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

  if (importMapper) {
    const importMapperResult = importMapper(component, theImport, importedValues, componentsUsed);
    // If import mapper has no result we skip this
    if (importMapperResult) {
      return importMapperResult;
    }
  }

  return importValue
    ? `import ${isTypeImport ? 'type' : ''} ${importValue} from '${path}';`
    : `import '${path}';`;
};

const renderImports = ({
  imports,
  target,
  asyncComponentImports,
  excludeMitosisComponents,
  preserveFileExtensions = false,
  component,
  componentsUsed,
  importMapper,
  explicitImportFileExtension,
}: ImportArgs & {
  imports: MitosisImport[];
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
    .map((theImport) =>
      renderImport({
        theImport,
        target,
        asyncComponentImports,
        preserveFileExtensions,
        component,
        componentsUsed,
        importMapper,
        explicitImportFileExtension,
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
  importMapper,
  explicitImportFileExtension = false,
  excludeExportAndLocal = false,
}: Omit<ImportArgs, 'explicitImportFileExtension' | 'asyncComponentImports'> &
  Partial<Pick<ImportArgs, 'explicitImportFileExtension' | 'asyncComponentImports'>> & {
    component: MitosisComponent;
    target: Target;
    excludeMitosisComponents?: boolean;
    excludeExportAndLocal?: boolean;
  }): string => `
    ${renderImports({
      imports: component.imports,
      target,
      asyncComponentImports,
      excludeMitosisComponents,
      preserveFileExtensions,
      component,
      componentsUsed,
      importMapper,
      explicitImportFileExtension,
    })}
    ${excludeExportAndLocal ? '' : renderExportAndLocal(component)}
    ${component.hooks.preComponent?.code || ''}
  `;

const renderExportAndLocal = (component: MitosisComponent): string => {
  return Object.keys(component.exports || {})
    .map((key) => component.exports![key].code)
    .join('\n');
};
