import { expect, test as playwrightTest } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { PackageName } from '../src/testConfig';

const test = playwrightTest.extend<{ packageName: PackageName | 'DEFAULT' }>({
  // this is provided by `playwright.config.ts`
  packageName: ['DEFAULT', { option: true }],
});

test.describe('file-system', () => {
  test('named slot', async ({ page, packageName }) => {
    if (['e2e-alpine'].includes(packageName)) {
      test.skip();
    }

    await page.goto('/named-slot/');

    const outputDir = packageName.replace('e2e-', '').replace('3', '');
    let fileEnding: string = 'tsx';
    let slotName: string = 'testSlot';

    if (packageName === 'e2e-angular') {
      fileEnding = 'ts';
      slotName = 'test-slot';
    } else if (packageName === 'e2e-vue3') {
      fileEnding = 'vue';
      slotName = 'test-slot';
    } else if (packageName === 'e2e-svelte') {
      fileEnding = 'svelte';
      slotName = 'test-slot';
    }

    const filePath = `./output/${outputDir}/src/components/named-slot.${fileEnding}`;

    let slotFound = false;
    if (existsSync(filePath)) {
      const fileContent = readFileSync(filePath, { encoding: 'utf8' });
      slotFound = fileContent.includes(slotName);
    }

    await expect(slotFound).toBeTruthy();
  });
});
