// Update a node_modules file to remove a block of code that causes an error in vite
// only in this project for some reason. I've spent hours looking for a real fix so
// here we are
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(
  process.cwd(),
  'node_modules/@builder.io/qwik-city/middleware/request-handler/index.mjs',
);

try {
  // Read the file
  const data = await fs.readFile(filePath, 'utf8');

  // Define the block of code to remove
  const codeToRemove = `
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
`.trim();

  // Remove the code block
  const updatedData = data.replace(codeToRemove, '');

  // Write the file back
  await fs.writeFile(filePath, updatedData, 'utf8');
  console.log('File updated successfully!');
} catch (err) {
  console.error('Error processing file:', err);
}
