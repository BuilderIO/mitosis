/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: ['react', 'svelte'],
  options: {
    react: {
      typescript: false,
    },
    svelte: {
      typescript: true,
    },
  },
};
