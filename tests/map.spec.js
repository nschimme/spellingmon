import { test, expect } from '@playwright/test';

async function bypassOnboarding(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Start Game/i }).click();

  // 1. Language Selection
  await page.getByRole('button').filter({ hasText: /English/i }).click();

  // 2. Audio Check
  await page.getByRole('button', { name: /Test Voice/i }).click();
  await page.getByRole('button', { name: /Yes/i }).click();

  // 3. Save Selection
  await page.locator('.relative.border-4.p-6').first().click();
  await page.getByRole('button', { name: /Start/i }).click();

  // 4. Character Creation
  await page.getByPlaceholder(/Enter your name/i).fill('Tester');
  await page.getByRole('button', { name: /Confirm/i }).click();

  // 5. Starter Selection
  await page.waitForSelector('text=Grammander');
  await page.click('text=Grammander');
}

test('map renders correctly in menu', async ({ page }) => {
  await bypassOnboarding(page);

  // Wait for world map
  await page.waitForSelector('text=Tester');

  // Open menu
  await page.keyboard.press('Escape');
  await page.waitForSelector('text=Back to Game', { timeout: 10000 });

  await page.click('button:has-text("Map")');

  const canvas = page.locator('[data-testid="map-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 15000 });
});
