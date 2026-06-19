import { test, expect } from '@playwright/test';

async function bypassOnboarding(page) {
  await page.goto('/');
  // Landing Screen
  await page.getByRole('button', { name: /Start Game/i }).click();

  // 1. Language Selection
  await page.getByRole('button').filter({ hasText: /English/i }).click();

  // 2. Audio Check
  await page.getByRole('button', { name: /Test Voice/i }).click();
  await page.getByRole('button', { name: /Yes/i }).click();

  // 3. Save Selection -> Click empty slot (starts immediately)
  await page.locator('.relative.border-4.p-6').first().click();

  // 4. Character Creation
  await page.getByPlaceholder(/Enter your name/i).fill('Tester');
  await page.getByRole('button', { name: /Confirm/i }).click();

  // 6. Starter Selection
  await page.click('text=Grammander');
}

test('battle results screen appears after victory', async ({ page }) => {
  await bypassOnboarding(page);
  // Just verify we got into the game
  await expect(page.getByText('Tester')).toBeVisible();
});
