module.exports = {
  files: 'src/**',
  targets: [
    'react',
    'qwik',
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
      info.path =
        'output/next-js/components/' + info.path.replace('.lite.tsx', '.tsx');
    }

    if (info.target === 'qwik') {
      // info.path = 
    }

    return info;
  },
};
