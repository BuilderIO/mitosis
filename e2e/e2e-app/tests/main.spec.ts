import { expect, test } from '@playwright/test';

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

  test('template, script and style tags', async ({ page }) => {
    const consoleMsg: string[] = [];
    page.on('console', (msg) => consoleMsg.push(msg.text()));

    await page.goto('/special-tags/');

    await expect(page.locator('body')).not.toContainText('Template Tag Div');
    await expect(page.locator('template')).toBeDefined();

    const div = page.locator('.wrap');
    await expect(div).toHaveCSS('background-color', 'rgb(255, 0, 0)');

    await expect(consoleMsg.includes('hello from script tag.')).toBe(true);
  });
});
