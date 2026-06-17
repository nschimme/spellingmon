import { test, expect } from '@playwright/test';

test('map renders correctly in menu', async ({ page }) => {
  await page.goto('/?debug=true&name=Tester&starter=Grammander&locale=en-US');

  // Wait for world map
  await page.waitForSelector('text=Tester');

  // Open menu
  await page.keyboard.press('Escape');

  // Use keyboard to navigate to MAP (3rd item: Party, Spellingdex, Map)
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // Wait for ANY detail view content
  await page.waitForSelector('h2', { timeout: 10000 });

  // The map canvas should be rendered in the detail view
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
});
