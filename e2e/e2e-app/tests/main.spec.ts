import { expect, test as playwrightTest } from '@playwright/test';
import { PackageName } from '../src/testConfig';

const test = playwrightTest.extend<{ packageName: PackageName | 'DEFAULT' }>({
  // this is provided by `playwright.config.ts`
  packageName: ['DEFAULT', { option: true }],
});

test.describe('e2e', () => {
  test('todo list add', async ({ page }) => {
    await page.goto('/one-component/');

    // await expect(page.locator('li')).toHaveCount(2);

    await page.locator('input').click();

    await page.locator('input').fill('Test Items One');

    await page.locator('text=Add list item').click(); // Add button

    // await expect(page.locator('li')).toHaveCount(3);
  });
  test('todo list add - multi component', async ({ page }) => {
    await page.goto('/two-components/');

    // await expect(page.locator('li')).toHaveCount(2);

    await page.locator('input').click();

    await page.locator('input').fill('Test Items One');

    await page.locator('text=Add list item').click(); // Add button

    // await expect(page.locator('li')).toHaveCount(3);
  });
  test('show-for component test', async ({ page }) => {
    await page.goto('/show-for-component/');

    await expect(page.locator('text=number :1')).toBeVisible();
    await expect(page.locator('text=number :2')).toBeVisible();
    await expect(page.locator('text=number :3')).toBeVisible();
  });

  test.describe('special HTML tags', () => {
    test('template tag', async ({ page, packageName }) => {
      await page.goto('/special-tags/');

      await expect(page.locator('template')).toBeDefined();
    });

    test('script tag', async ({ page, packageName }) => {
      if (['e2e-solid', 'e2e-react'].includes(packageName)) {
        test.skip();
      }

      const consoleMsg: string[] = [];
      page.on('console', (msg) => consoleMsg.push(msg.text()));

      await page.goto('/special-tags/');

      await expect(consoleMsg.includes('hello from script tag.')).toBe(true);
    });

    test('style tag', async ({ page, packageName }) => {
      await page.goto('/special-tags/');

      const div = page.locator('.wrap');
      await expect(div).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    });
  });
});
