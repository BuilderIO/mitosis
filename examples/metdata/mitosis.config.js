const metadataPlugin = () => ({
  code: {
    pre: (code, json) => {
      if (json.meta.useMetadata) {
        return `
          /**
          useMetadata:
          ${JSON.stringify(json.meta.useMetadata)}
          */
          
          ${code}`;
      }

      return code;
    },
  },
});

module.exports = {
  files: 'src/**',
  commonOptions: {
    plugins: [metadataPlugin],
  },
  targets: [
    'react',
    // still unsupported
    // 'qwik',
    // 'builder',
    'vue',
    'html',
    // TO-DO: fix error causing svelte output not to work
    // 'svelte',
    'solid',
    'angular',
    'webcomponent',
  ],
};
