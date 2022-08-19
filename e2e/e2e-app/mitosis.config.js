// A real Mitosis application usually has a set of targets to include here;
// for this E2E test, we vary it by invocation to separately compile each target,
// so that one failing does not stop the whole process.

const allTargets = [
  'angular',
  // 'builder',
  'customElement',
  'html',
  // 'liquid',
  'qwik',
  'react',
  'reactNative',
  'solid',
  'svelte',
  // 'swift', // Unsupported event binding "onClick$"
  // 'template',
  'vue2',
  'vue3',
  'webcomponent',
];

// If not specified on the command line, build for
// the whole list of supported targets - this is used
// during development to check if Mitosis is ready
// to delete the one-at-a-time mechanism.

const target = process.argv[3];
const targets = target ? [target] : allTargets;
const outputDir = target ? 'output/' + target : 'output';

const vueConfig = {
  transpiler: { format: 'esm' },
  asyncComponentImports: true,
};

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets,
  // Each run needs a separate output dest, as Mitosis clears it first.
  dest: [outputDir],
  options: {
    react: { transpiler: { format: 'esm', languages: ['ts'] } },
    solid: { transpiler: { languages: ['ts'] } },
    vue2: vueConfig,
    vue3: vueConfig,
  },
};
