import { readFile, writeFile } from 'fs/promises';

const prettier = require('prettier');

export interface Entry {
  caseName: string;
  target: string;
  ok: boolean;
}

const friendlyCaseNames: Record<string, string> = {
  '01-one-component': 'Single Component',
  '02-two-components': 'Multiple Components',
};

export async function emitTable(allResults: Entry[]) {
  const cols: string[] = [];
  const rows: string[] = [];
  const result: string[][] = [];
  const output: string[] = [];

  function axisIndex(arr: string[], value: string): number {
    let x = arr.indexOf(value);
    if (x < 0) {
      x = arr.push(value) - 1;
    }
    return x;
  }

  for (const e of allResults) {
    const col = axisIndex(cols, e.caseName);
    const row = axisIndex(rows, e.target);
    if (result.length <= row) result.push([]);
    const rowData = result[row];
    while (rowData.length <= col) rowData.push('');
    result[row][col] = e.ok ? ':white_check_mark:' : ':x:';
  }

  output.push(
    'Target | ' +
      cols.map((caseId) => friendlyCaseNames[caseId] || caseId.replace(/-/g, ' ')).join(' | '),
  );
  output.push('-|-'.repeat(cols.length));

  for (const index in rows) {
    const targetName = rows[index].replace('e2e-', '');
    output.push(targetName + ' | ' + result[index].join(' | '));
  }

  const formattedTable = prettier.format(output.join('\n'), { parser: 'markdown' });
  await writeFile('./e2e-test-status.md', formattedTable, 'utf8');

  // Write it in to the README
  const outputFile = '../../docs/test-status.md';
  const currentReadme = await readFile(outputFile, 'utf-8');

  const before = currentReadme.match(/.*## E2E test status/gms)![0];
  const after = currentReadme.match(/## Contribute.*/gms)![0];
  const newReadme = `${before}

${formattedTable}
_NOTE: this matrix is programmatically generated and should not be manually edited._

${after}`;

  await writeFile(outputFile, newReadme, 'utf-8');
  // cut before/after the heading and next heading
  // write with this inserted

  // CI can look at whether this changed the README, and fail the PR if so.
}

// Useful to test this module alone:

// emitTable([
//   { caseName: '01-one-component', target: 'e2e-angular', ok: true },
//   { caseName: '01-one-component', target: 'e2e-qwik', ok: true },
//   { caseName: '01-one-component', target: 'e2e-react', ok: true },
//   { caseName: '01-one-component', target: 'e2e-vue3', ok: true },
//   { caseName: '02-two-components', target: 'e2e-angular', ok: true },
//   { caseName: '02-two-components', target: 'e2e-qwik', ok: false },
//   { caseName: '02-two-components', target: 'e2e-vue2', ok: true },
//   { caseName: '02-two-components', target: 'e2e-vue3', ok: true },
//   { caseName: '03-something', target: 'e2e-angular', ok: true },
//   { caseName: '03-something', target: 'e2e-qwik', ok: false },
//   { caseName: '03-something', target: 'e2e-vue3', ok: true },
//   { caseName: '04-another-example', target: 'e2e-solid', ok: true },
//   { caseName: '04-another-example', target: 'e2e-svelte', ok: true },
// ]);
