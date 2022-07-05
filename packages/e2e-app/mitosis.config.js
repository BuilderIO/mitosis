/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  // A real Mitosis application usually has a set of targets to include here;
  // for this E2E test, we vary it by invocation to separately test each target,
  // so that one failing does not stop the whole test suite.
  targets: [process.argv[3]],
  // Each run needs a separate output dest, as Mitosis clears it first.
  dest: ['output/' + process.argv[3]],
  options: {
    react: { transpiler: { format: 'esm', languages: ['ts'] } },
    solid: { transpiler: { languages: ['ts'] } },
  },
};
