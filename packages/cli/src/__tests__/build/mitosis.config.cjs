/**
 * @type {import('@mitosis/types').MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: ['angular', 'react', 'vue'],
  commonOptions: {
    typescript: true,
  },
  options: {
    angular: {},
    react: {},
    vue: {
      api: 'composition',
    },
  },
};
