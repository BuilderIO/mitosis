/**
 * @param {string} string
 */
const kebabCase = (string) => string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

/**
 * @type {MitosisConfig['getTargetPath']}
 */
const getTargetPath = ({ target }) => {
  switch (target) {
    // we have to workaround a name collision, where the folder can't have the name of the `exports` property in package.json.
    // crazy, crazy stuff.
    case 'vue2':
      return 'vue/packages/_vue2';
    case 'vue':
    case 'vue3':
      return 'vue/packages/_vue3';
    default:
      return kebabCase(target);
  }
};
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
  getTargetPath,
};
