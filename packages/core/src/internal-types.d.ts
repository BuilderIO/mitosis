declare module '@fake*';

declare module 'rollup/dist/rollup.browser.es' {
  const exported: typeof import('rollup');
  export = exported;
}
