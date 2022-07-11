const vueConfig = {
  transpiler: { format: 'esm' },
  asyncComponentImports: true,
};

const target = process.argv[3];

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  // A real Mitosis application usually has a set of targets to include here;
  // for this E2E test, we vary it by invocation to separately test each target,
  // so that one failing does not stop the whole test suite.
  targets: [target],
  // Each run needs a separate output dest, as Mitosis clears it first.
  dest: ['output/' + target],
  options: {
    react: { transpiler: { format: 'esm', languages: ['ts'] } },
    solid: { transpiler: { languages: ['ts'] } },
    vue2: vueConfig,
    vue3: vueConfig,
  },
};
