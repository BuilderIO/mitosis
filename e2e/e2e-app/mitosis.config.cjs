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
      api: 'signals',
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
