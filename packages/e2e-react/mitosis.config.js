module.exports = {
  files: 'src/**',
  dest: 'react_src/lib',
  targets: ['react'],
  options: {
    react: { transpiler: { format: 'esm' } },
  },
};
