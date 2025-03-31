/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
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
    'stencil',
    'svelte',
    'vue',
    'webcomponent',
  ],
  commonOptions: {
    typescript: true,
    explicitBuildFileExtensions: {
      '.md': /.*(docs\.lite\.tsx)$/g,
    },
    plugins: [
      () => ({
        code: {
          post: (code, json) => {
            if (json.meta?.useMetadata?.docs) {
              return (
                `# ${json.name} - ${json.pluginData?.target}\n\n` +
                `${JSON.stringify(json.meta?.useMetadata?.docs)}\n\n` +
                'This is the content:\n' +
                '````\n' +
                code +
                '\n````'
              );
            }

            return code;
          },
        },
      }),
    ],
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
    stencil: {
      prefix: 'e2e',
    },
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
