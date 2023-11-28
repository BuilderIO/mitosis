// Mitosis E2E orchestration script

import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import syncDirectory from 'sync-directory';

import { emitTable, Entry } from './e2e-output';

// Update this array when adding new cases.

const cases = [
  '01-one-component',
  '02-two-components',
  // '03-types'
];

// Update this array when Mitosis adds new targets

const packages = [
  '@builder.io/e2e-alpine',
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

// To keep the E2E code minimal, the case and target names are currently treated
// as string (untyped) data. Since only a (hopefully near 0) list of
// allow-to-fail cases is stored, it seems a reasonable tradeoff.

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

async function nxRunMany(target: string, projects: string[]) {
  return new Promise((res, reject) => {
    let child = spawn(`nx run-many --target ${target} --parallel 4 --projects ${projects.join()}`, {
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
  const json = await readFile('./playwright-results.json', 'utf-8');
  const results = JSON.parse(json);
  return results.suites[0].suites.map((y) => ({
    caseName,
    target: y.title,
    ok: allOk(y.specs),
  }));
}

async function detectFailures(allResults: any[]) {
  // Look for any failures, except those explicity allowed. A failure would be
  // allowed so that the case and progress can be merged, even where Mitosis
  // doesn't have complete support across all targets yet.

  const allowFailuresJson = await readFile('./allow-failures.json', 'utf-8');
  const allowFailures: Entry[] = JSON.parse(allowFailuresJson);

  const didntPass = allResults.filter((e) => !e.ok);
  const regressions = didntPass.filter(
    (dp) => !allowFailures.find((af) => dp.caseName == af.caseName && dp.target == af.target),
  );

  if (regressions.length > 0) {
    console.error('E2E regressions, these formerly passed!', regressions);
    throw new Error('E2E regressions: ' + regressions.length);
  }
}

async function main() {
  const allResults: Entry[] = [];

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
    await nxRunMany('clean', packages);

    // Mitosis all targets - with a workaround to tolerate failure, until:
    // https://github.com/BuilderIO/mitosis/issues/510
    await yarn('workspace', '@builder.io/e2e-app', 'run', 'run-mitosis-separately');

    // Build the libraries and host apps in the normal way.
    // Ideally we could use Yarn Workspace, but it lacks a partial-success-OK flag.
    // await yarn('workspaces', 'foreach', '-pt', '--include', '*/e2e-*', '--verbose', 'run', 'build');

    try {
      await nxRunMany('build', packages);
    } catch (e) {
      console.log('Build Failed', 'proceeding with E2E');
    }

    // Invoke Playwright to test them all.
    try {
      await yarn('workspace', '@builder.io/e2e-app', 'run', 'playwright');
    } catch (e) {
      console.log('Playwright failed, proceeding anyway');
    }

    allResults.push(...(await readSummary(c)));
  }

  // console.log('E2E results', allResults);

  console.log('Writing E2E status');
  await writeFile('./e2e-test-status.json', JSON.stringify(allResults, undefined, 2), 'utf8');

  console.log('Updating README with E2E status');
  await emitTable(allResults);

  await detectFailures(allResults);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
