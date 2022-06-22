module.exports = {
  files: 'src/**',
  targets: [
    // 'qwik',  // CLI does not support target: qwik
    // 'builder', // CLI does not support target: builder
    'html', // HTML output in a JS file
    'webcomponent', // TS output in a JS file
  ],
};
