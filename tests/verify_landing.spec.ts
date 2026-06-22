import { test, expect } from '@playwright/test';

test('verify landing page layout', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#landing-title');

  // Desktop
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: 'landing-desktop.png' });

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'landing-mobile.png' });
});
