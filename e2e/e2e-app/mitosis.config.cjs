/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: [
    'alpine',
    'angular',
    'customElement',
    'html',
    'qwik',
    'react',
    'reactNative',
    'solid',
    'svelte',
    'vue',
    'webcomponent',
  ],
  commonOptions: {
    typescript: true,
  },
  options: {
    angular: {
      preserveImports: true,
      importMapper: (component, theImport, importedValues, componentsUsed) => {
        if (theImport.path.endsWith('.lite')) {
          const cleanPath = theImport.path.replaceAll('-', '').replace('.lite', '').toLowerCase();

          const component = componentsUsed.find((componentUsed) => {
            return cleanPath.includes(componentUsed.toLowerCase());
          });
          if (component) {
            return `import {${component}Module} from "${theImport.path.replace('.lite', '')}";`;
          }
        }

        return `import ${importedValues.namedImports} from '${theImport.path}';`;
      },
    },
    react: { transpiler: { format: 'esm', languages: ['ts'] } },
    solid: { transpiler: { languages: ['ts'] } },
    vue: {
      transpiler: { format: 'esm' },
      asyncComponentImports: true,
      api: 'composition',
    },
    qwik: {},
    svelte: {},
  },
};
