module.exports = {
  files: 'src/**',
  targets: [
    'react',
    // still unsupported
    // 'qwik',
    // 'builder',
    'vue',
    'html',
    // TO-DO: fix error causing svelte output not to work
    // 'svelte',
    'solid',
    'angular',
    'webcomponent',
  ],
};
