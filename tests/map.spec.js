import { test, expect } from '@playwright/test';

test('map renders correctly in menu', async ({ page }) => {
  await page.goto('/');

  // Start game and select starter to get into the world
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.fill('input[placeholder="NAME"]', 'TestPlayer');
  await page.click('text=Confirm');

  // Wait for TTS verification (simplified skip if possible, or just wait)
  await page.waitForSelector('text=Audio Check');
  await page.click('text=Test Voice');
  await page.click('text=Yes');

  // Select a starter
  await page.click('text=Grammander');

  // Wait for world map
  await page.waitForSelector('text=TestPlayer');

  // Open menu
  await page.keyboard.press('Escape');

  // Go to Map tab
  await page.click('button:has-text("Map")');

  // Check if canvas exists and has correct dimensions
  const canvas = page.locator('[data-testid="map-canvas"]');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(100);

  // Take a screenshot for verification
  await page.screenshot({ path: 'tests/map-render.png' });
});
