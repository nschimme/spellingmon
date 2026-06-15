import { test, expect } from '@playwright/test';

async function bypassOnboarding(page) {
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.getByRole('button').filter({ hasText: /English/i }).click();
  await page.getByRole('button', { name: 'Test Voice' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByPlaceholder('Enter your name').fill('Tester');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForSelector('text=GRAMMANDER');
  await page.click('text=GRAMMANDER');
}

test('map renders correctly in menu', async ({ page }) => {
  await page.goto('/');
  await bypassOnboarding(page);

  // Wait for world map
  await page.waitForSelector('text=Tester');

  // Open menu
  await page.keyboard.press('Escape');
  await page.waitForSelector('text=BACK TO GAME', { timeout: 10000 });

  await page.click('button:has-text("MAP")');

  const canvas = page.locator('[data-testid="map-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 15000 });
});
