/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: ['react', 'svelte'],
  dest: 'packages',
  commonOptions: {
    typescript: true,
  },
  options: {
    react: {},
    svelte: {},
  },
};
