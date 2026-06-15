import { test, expect } from '@playwright/test';

async function bypassOnboarding(page) {
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.getByRole('button').filter({ hasText: 'English' }).click();
  await page.getByRole('button', { name: 'Test Voice' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByPlaceholder('Enter your name').fill('Tester');
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Wait for starters to be visible and click one
  const starter = page.getByText('GRAMMANDER');
  await expect(starter).toBeVisible();
  await starter.click();
}

test('menu UX hierarchical navigation works', async ({ page }) => {
  await page.goto('/');
  await bypassOnboarding(page);

  // Wait for world map HUD or something that confirms we are in the game
  await page.waitForSelector('text=Tester', { timeout: 10000 });

  // Open menu
  await page.keyboard.press('Escape');

  // Check if menu list is visible (use the specific title)
  const menuTitle = page.locator('h1', { hasText: /MENU/i });
  await expect(menuTitle).toBeVisible();

  // Test Spellingdex navigation
  await page.getByRole('button', { name: /Spellingdex/i }).click();
  await expect(page.getByText(/SEEN/i).first()).toBeVisible();

  // Test return to main menu
  await page.locator('button', { hasText: '◀' }).click();
  await expect(page.getByRole('button', { name: /Spellingdex/i })).toBeVisible();

  // Test Settings navigation
  await page.getByRole('button', { name: /Settings/i }).click();
  await expect(page.getByText(/TTS VOICE/i)).toBeVisible();

  // Test return to main menu
  await page.locator('button', { hasText: '◀' }).click();
  await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();

  // Final escape to close menu
  await page.keyboard.press('Escape');
  await expect(menuTitle).not.toBeVisible();
});
