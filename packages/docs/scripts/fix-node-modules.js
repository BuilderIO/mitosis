// Update a node_modules file to remove a block of code that causes an error in vite
// only in this project for some reason. I've spent hours looking for a real fix,
// And of course, patch-package is erroring too, so here we are.
import fs from 'fs/promises';

const replacements = [
  {
    // Remove perf_hooks package require() or vite will error
    path: 'node_modules/@ts-morph/common/dist/typescript.js',
    from: `
        const { performance: performance2, PerformanceObserver: PerformanceObserver2 } =   require("perf_hooks");
        if (hasRequiredAPI(performance2, PerformanceObserver2)) {
          return {
            // By default, only write native events when generating a cpu profile or using the v8 profiler.
            shouldWriteNativeEvents: false,
            performance: performance2,
            PerformanceObserver: PerformanceObserver2
          };
        }`.trim(),
    to: '',
  },
  {
    // Remove node:async_hooks package require() or vite will error
    path: 'node_modules/@builder.io/qwik-city/middleware/request-handler/index.mjs',
    from: `
import("node:async_hooks").then((module) => {
  const AsyncLocalStorage = module.AsyncLocalStorage;
  asyncStore = new AsyncLocalStorage();
  globalThis.qcAsyncRequestStore = asyncStore;
}).catch((err) => {
  console.warn(
    "AsyncLocalStorage not available, continuing without it. This might impact concurrent server calls.",
    err
  );
});
`.trim(),
    to: '',
  },
  // Remove process.env.NODE_ENV = 'development' from postcss-load-config to fix vite error
  {
    path: 'node_modules/postcss-load-config/src/index.js',
    from: "process.env.NODE_ENV = 'development'",
    to: '',
  },
];

try {
  await Promise.all(
    replacements.map(async ({ path, from, to }) => {
      // Read the file
      const data = await fs.readFile(process.cwd() + '/' + path, 'utf8');

      const updatedData = data.replace(from, to || '');

      // Write the file back
      await fs.writeFile(path, updatedData, 'utf8');
      console.log('File updated successfully!', path);
    }),
  );
} catch (err) {
  console.error('Error processing file:', err);
}
