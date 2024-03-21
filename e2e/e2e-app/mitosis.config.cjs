const vueConfig = {
  transpiler: { format: 'esm' },
  asyncComponentImports: true,
  typescript: true,
};

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: [
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
  options: {
    angular: {
      typescript: true,
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
    react: { transpiler: { format: 'esm', languages: ['ts'] }, typescript: true },
    solid: { transpiler: { languages: ['ts'] }, typescript: true },
    vue: { ...vueConfig, api: 'composition' },
    qwik: { typescript: true },
    svelte: { typescript: true },
  },
};
