import { test, expect } from '@playwright/test';

test('verify landing desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('h1');
  await page.screenshot({ path: 'verification/landing_desktop_final.png' });
});

test('verify landing mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('h1');
  await page.screenshot({ path: 'verification/landing_mobile_final.png' });
});
