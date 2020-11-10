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
    '@jsx-lite/(.+)$': '<rootDir>../../packages/$1/src',
  },
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.raw\\.(ts|tsx|js|jsx)$': 'jest-raw-loader',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>../../jest/setupTests.ts'],
};
