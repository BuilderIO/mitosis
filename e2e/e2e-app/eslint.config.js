import mitosis from '@builder.io/eslint-plugin-mitosis';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.lite.tsx', '**/*.lite.jsx'],
    ...mitosis.configs.recommended,
    languageOptions: {
      ...mitosis.configs.recommended.languageOptions,
      parser: tsParser,
    },
  },
];
