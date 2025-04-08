import { MitosisConfig } from '@builder.io/mitosis';

const config: MitosisConfig = {
  files: 'src/**',
  targets: ['angular', 'react', 'vue'],
  commonOptions: {
    typescript: true,
  },
  options: {
    angular: {},
    react: {},
    vue: {
      api: 'composition',
    },
  },
};

export default config;
