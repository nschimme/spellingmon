import { test, expect } from '@playwright/test';

test('Debug mode should bypass onboarding', async ({ page }) => {
  page.on('pageerror', err => {
    console.error('[BROWSER EXCEPTION]', err.stack);
  });

  await page.goto('/?debug=true&name=Tester&starter=Grammander&locale=en-US');

  await page.waitForTimeout(5000);
});
