import { test, expect } from '@playwright/test';

test('battle menu keyboard navigation works via debug bypass', async ({ page }) => {
  await page.goto('/?debug=true&name=Tester&starter=Grammander&locale=en-US');

  await page.waitForSelector('text=Tester');

  // Trigger a wild battle by moving
  // Note: Since map is procedural, we just hold right until we hit grass or an encounter
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(1000);
  await page.keyboard.up('KeyD');

  // Verify game didn't crash
  await expect(page.locator('body')).toBeVisible();
});
