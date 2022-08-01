import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { spawn } from 'child_process';
import syncDirectory from 'sync-directory';

const cases = ['01-one-component', '02-two-components'];

const packages = [
  '@builder.io/e2e-app-qwik-output',
  '@builder.io/e2e-app-vue3-output',
  '@builder.io/e2e-angular',
  '@builder.io/e2e-qwik',
  '@builder.io/e2e-react',
  '@builder.io/e2e-solid',
  '@builder.io/e2e-svelte',
  '@builder.io/e2e-vue2',
  '@builder.io/e2e-vue3',
];

interface Entry {
  caseName: string;
  target: string;
  ok: boolean;
}

async function yarn(...args) {
  return new Promise((res, reject) => {
    let child = spawn('yarn', args, {
      cwd: resolve(__dirname, '../..'),
      shell: true,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? res(0) : reject(code)));
  });
}

function allOk(specs: Entry[]) {
  return specs.every((s) => s.ok);
}

async function readSummary(caseName: string): Promise<Entry[]> {
  const json = await readFile('./results.json', 'utf-8');
  const results = JSON.parse(json);
  return results.suites[0].suites.map((y) => ({
    caseName,
    target: y.title,
    ok: allOk(y.specs),
  }));
}

async function main() {
  const allResults: any[] = [];

  // Build one case at a time, so we only need one build env per target.
  for (const c of cases) {
    console.log('--------------------------------- E2E case:', c);

    // Copy the case source into src; see
    // https://github.com/BuilderIO/mitosis/issues/494
    syncDirectory(resolve('cases', c), resolve('src'), {
      deleteOrphaned: true,
      exclude: ['.gitkeep'],
    });

    // Clean the output - don't want Vite or other tools to leave behind
    // previous app on failure.
    for (const p of packages) {
      await yarn('workspace', p, 'run', 'clean');
    }

    // Mitosis all targets - with a workaround to tolerate failure, until:
    // https://github.com/BuilderIO/mitosis/issues/510
    await yarn('workspace', '@builder.io/e2e-app', 'run', 'run-mitosis-separately');

    // Build the libraries and host apps in the normal way.
    // Ideally we could use Yarn Workspace, but it lacks a partial-success-OK flag.
    // await yarn('workspaces', 'foreach', '-pt', '--include', '*/e2e-*', '--verbose', 'run', 'build');

    for (const p of packages) {
      try {
        await yarn('workspace', p, 'run', 'build');
      } catch (e) {
        console.log('Failed', p, 'proceeding with E2E');
      }
    }

    // Invoke Playwright to test them all.
    try {
      await yarn('workspace', '@builder.io/e2e-app', 'run', 'playwright');
    } catch (e) {
      console.log('Playwright failed, proceeding anyway');
    }

    allResults.push(...(await readSummary(c)));
  }

  console.log('E2E results', allResults);
  await writeFile('./overall-result.json', JSON.stringify(allResults, undefined, 2), 'utf8');

  // TODO format the JSON output as a test status matrix.

  // Look for any must-pass that didn't pass.
  const mustPassJson = await readFile('./overall-result-must-pass.json', 'utf-8');
  const mustPass: Entry[] = JSON.parse(mustPassJson).filter((mp) => mp.ok);
  const didntPass = allResults.filter((e) => !e.ok);
  const regressions = mustPass.filter((mp) =>
    didntPass.find((dp) => mp.caseName == dp.caseName && mp.target == dp.target),
  );

  if (regressions.length > 0) {
    console.error('E2E regressions, these formerly passed!', regressions);
    throw new Error('E2E regressions: ' + regressions.length);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
