import { test, expect } from '@playwright/test';

test('todo list add', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('li')).toHaveCount(2);

  await page.locator('input').click();

  await page.locator('input').fill('Test Items One');

  await page.locator('text=Add list item').click(); // Add button

  await expect(page.locator('li')).toHaveCount(3);
});
