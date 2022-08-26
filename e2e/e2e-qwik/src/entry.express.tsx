import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import render from './entry.ssr';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Create an express server
 * https://expressjs.com/
 */
const app = express();

/**
 * Serve static client build files,
 * hashed filenames, immutable cache-control
 */
app.use(
  '/build',
  express.static(join(__dirname, '..', 'dist', 'build'), {
    immutable: true,
    maxAge: '1y',
  }),
);

/**
 * Serve static public files at the root
 */
app.use(express.static(join(__dirname, '..', 'dist'), { index: false }));

/**
 * Server-Side Render Qwik application
 */
app.get('/*', async (req, res, next) => {
  try {
    // Render the Root component to a string
    const result = await render({
      stream: res,
    });

    // respond with SSR'd HTML
    if ('html' in result) {
      res.send((result as any).html);
    } else {
      res.end();
    }
  } catch (e) {
    // Error while server-side rendering
    next(e);
  }
});

// Qwik's express server modified to accept --port parameter.
let port = 8080;
const argv = process.argv;
const portIndex = argv.indexOf('--port');
if (portIndex > 0 && portIndex < argv.length - 1) {
  port = +argv[portIndex + 1];
}

app.listen(port, () => {
  /* eslint-disable */
  console.log(`http://localhost:${port}/`);
});
