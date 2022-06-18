module.exports = {
  files: 'src/**',
  targets: [
    // still unsupported
    // 'qwik',
    // 'builder',
    'vue',
    'html',
    'svelte',
    'angular',
    'webcomponent',
  ],
  options: {
    react: { transpiler: { format: 'esm' } },
  },
};
