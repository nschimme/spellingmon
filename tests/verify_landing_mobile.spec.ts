import { test, expect } from '@playwright/test';

test('verify landing page on mobile viewport', async ({ page }) => {
  // Set viewport to a common mobile size (iPhone SE)
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('http://localhost:5173');

  // Wait for the landing screen elements
  await page.waitForSelector('#landing-title');

  // Take a screenshot
  await page.screenshot({ path: 'landing-mobile-fixed.png' });

  // Basic check: title should be visible and not overflowing
  const title = await page.locator('#landing-title');
  const box = await title.boundingBox();
  expect(box.width).toBeLessThan(375);
});
