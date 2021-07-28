module.exports = {
  files: 'src/**',
  targets: ['qwik'],
  options: {
    qwik: {
      qwikLib: '../../qwik.js',
    },
  },
  mapFile(info) {
    if (info.target === 'react') {
      info.path =
        'output/next-js/components/' + info.path.replace('.lite.tsx', '.tsx');
    }

    if (info.target === 'qwik') {
      info.path =
        '../../../../forks/qwik/integration/site/ui/' +
        info.path.replace('.lite.tsx', '.ts');
    }

    return info;
  },
};
