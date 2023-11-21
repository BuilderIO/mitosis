/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = {
  files: 'src/**',
  targets: ['qwik', 'react', 'svelte'],
  dest: 'packages',
  commonOptions: {
    typescript: true,
  },
  options: {
    react: {},
    svelte: {},
    qwik: {},
  },
};
