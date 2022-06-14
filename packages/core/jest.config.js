module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
      // module: 'commonjs',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '@builder.io/mitosis': '<rootDir>',
  },
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/*.test.+(ts|tsx)', '**/*.test.+(ts|tsx)'],
  transform: {
    '^.+\\.raw\\.(ts|tsx|js|jsx)$': 'jest-raw-loader',
    '^.+\\.lite\\.(ts|tsx|js|jsx)$': 'jest-raw-loader',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
