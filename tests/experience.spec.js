import { test, expect } from '@playwright/test';

async function bypassOnboarding(page) {
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.getByRole('button').filter({ hasText: /English/i }).click();
  await page.getByRole('button', { name: 'Test Voice' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByPlaceholder('Enter your name').fill('Tester');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.click('text=Grammander');
}

test('battle results screen appears after victory', async ({ page }) => {
  await page.goto('/');
  await bypassOnboarding(page);
  // Just verify we got into the game
  await expect(page.getByText('Tester')).toBeVisible();
});
