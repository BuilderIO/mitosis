import { componentToAngular } from '@/generators/angular';
import { runTestsForTarget } from './test-generator';

describe('Angular with Import Mapper Tests', () => {
  runTestsForTarget({
    options: {
      preserveImports: true,
      preserveFileExtensions: true,
      importMapper: (component: any, theImport: any, importedValues: any, componentsUsed: any) => {
        let importPath = theImport.path;

        for (const componentName of componentsUsed || []) {
          if (theImport.imports[componentName]) {
            importPath = theImport.path + '/angular';
          }
        }

        const { defaultImport, namedImports, starImport } = importedValues;

        let importValue;

        if (starImport) {
          importValue = ` * as ${starImport} `;
        } else {
          importValue = [defaultImport, namedImports]
            .filter(Boolean)
            .map((importName) => {
              for (const usedComponentName of componentsUsed || []) {
                if ((importName || '').indexOf(usedComponentName) > -1) {
                  return (importName || '').replace(
                    usedComponentName,
                    `${usedComponentName}Module`,
                  );
                }
              }
              return importName;
            })
            .join(', ');
        }

        return `import ${importValue} from '${importPath}';`;
      },
      bootstrapMapper: (name: any, componentsUsed: any, component: any) => {
        return 'bootstrap: [SomeOtherComponent]';
      },
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
