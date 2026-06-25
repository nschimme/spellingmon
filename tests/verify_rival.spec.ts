import { test, expect } from '@playwright/test';

test('verify rival placement and dialog', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.click('text=START');
  await page.click('button:has-text("English")');
  await page.click('button:has-text("Next")');
  await page.click('text=New Game');
  await page.waitForSelector('text=Choose your appearance');
  await page.click('button:has-text("Confirm")');

  // Skip Intro
  await page.waitForTimeout(1000);
  await page.mouse.click(400, 300);
  await page.waitForTimeout(500);
  await page.mouse.click(400, 300);

  await page.waitForSelector('text=Choose your starter');
  await page.click('text=🔥');
  await page.click('button:has-text("Confirm")');

  // home_2f -> home_1f
  await page.waitForTimeout(1000);
  // Stairs are usually top right in home_2f
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(160); }
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(160); }

  // home_1f -> Area 1
  await page.waitForTimeout(1000);
  // Exit is at bottom
  for (let i = 0; i < 10; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(160); }

  // Now in Area 1
  await page.waitForTimeout(1000);

  // Check for Rival emoji '🏃'
  const rival = page.locator('text=🏃');
  await expect(rival).toBeVisible();

  await page.screenshot({ path: 'verification/rival_spotted.png' });

  // Move down to trigger encounter
  for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(160); }

  // Check for dialog bubble
  const dialog = page.locator('.fixed.top-28'); // Global notification area
  await expect(dialog).toBeVisible();

  await page.screenshot({ path: 'verification/rival_dialog.png' });
});
