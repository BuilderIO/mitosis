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
    'vue2',
    'vue3',
    'webcomponent',
  ],
  options: {
    react: { transpiler: { format: 'esm', languages: ['ts'] }, typescript: true },
    solid: { transpiler: { languages: ['ts'] }, typescript: true },
    vue2: vueConfig,
    vue3: { ...vueConfig, api: 'composition' },
    qwik: { typescript: true },
    svelte: { typescript: true },
  },
};
