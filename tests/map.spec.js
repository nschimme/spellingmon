import { test, expect } from '@playwright/test';

test('map renders correctly in menu', async ({ page }) => {
  await page.goto('/');

  // Start game and select starter to get into the world
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.fill('input[placeholder="NAME"]', 'TestPlayer');
  await page.click('text=Confirm');

  // Wait for TTS verification
  await page.waitForSelector('text=Test Voice');
  await page.click('text=Test Voice');
  await page.waitForSelector('text=Yes');
  await page.click('text=Yes');

  // Select a starter
  await page.click('text=Grammander');

  // Wait for world map
  await page.waitForSelector('text=TestPlayer');

  // Open menu
  await page.keyboard.press('Escape');
  await page.waitForSelector('text=BACK TO GAME', { timeout: 10000 });

  // Go to Map tab using keyboard - this is more reliable for our custom implementation
  // We use ArrowRight to navigate tabs.
  // Order: PARTY -> PROGRESS -> MAP -> SETTINGS
  // NOTE: We click the tabs directly to avoid flaky keyboard navigation in tests
  await page.click('button:has-text("progress")');
  await page.waitForSelector('text=Unlocked Areas');
  await page.click('button:has-text("map")');
  await page.waitForSelector('text=Area Map (Discovered)');

  const canvas = page.locator('[data-testid="map-canvas"]');
  await expect(canvas).toBeVisible({ timeout: 15000 });

  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(100);

  // Take a screenshot for verification
  await page.screenshot({ path: 'tests/map-render.png' });
});
