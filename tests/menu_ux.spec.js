import { test, expect } from '@playwright/test';

test('menu UX hierarchical navigation works', async ({ page }) => {
  await page.goto('/');

  // Start game
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.fill('input[placeholder="NAME"]', 'MenuTester');
  await page.click('text=Confirm');
  await page.click('text=Test Voice');
  await page.click('text=Yes');
  await page.click('text=Grammander');

  // Wait for world map
  await page.waitForSelector('text=MenuTester');

  // Open menu
  await page.keyboard.press('Escape');
  await page.waitForSelector('text=BACK TO GAME');

  // Check main menu items
  await expect(page.locator('button:has-text("Party")')).toBeVisible();
  await expect(page.locator('button:has-text("Spellingdex")')).toBeVisible();

  // Enter Spellingdex
  await page.click('button:has-text("Spellingdex")');
  await page.waitForSelector('text=GLOBAL PROGRESS');

  // Verify main menu items are hidden
  await expect(page.locator('button:has-text("Party")')).not.toBeVisible();

  // Go back using UI button
  await page.click('button:has-text("◀")');
  await page.waitForSelector('text=BACK TO GAME');
  await expect(page.locator('button:has-text("Party")')).toBeVisible();

  // Enter Settings
  await page.click('button:has-text("Settings")');
  await page.waitForSelector('text=SOUND SETTINGS');

  // Go back using Backspace (our new feature)
  await page.keyboard.press('Backspace');
  await page.waitForSelector('text=BACK TO GAME');

  // Close menu
  await page.keyboard.press('Escape');
  await page.waitForSelector('text=BACK TO GAME', { state: 'hidden' });
});
