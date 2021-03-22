module.exports = {
  files: 'src/**',
  targets: [
    'react',
    'qoot',
    'vue',
    'html',
    'svelte',
    'solid',
    'angular',
    'builder',
    'webcomponents',
  ],
  mapFile(info) {
    if (info.target === 'react') {
      info.path = 'outputs/next/components/' + info.path;
    }

    return info;
  },
};
