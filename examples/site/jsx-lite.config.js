module.exports = {
  files: 'src/**',
  targets: ['qoot'],
  options: {
    qoot: {
      qootLib: '../../qoot.js',
    },
  },
  mapFile(info) {
    if (info.target === 'react') {
      info.path =
        'output/next-js/components/' + info.path.replace('.lite.tsx', '.tsx');
    }

    if (info.target === 'qoot') {
      info.path =
        '../../../../forks/qoot/integration/site/ui/' +
        info.path.replace('.lite.tsx', '.ts');
    }

    return info;
  },
};
