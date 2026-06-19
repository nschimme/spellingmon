import { test, expect } from '@playwright/test';

test('menu UX hierarchical navigation works via debug bypass', async ({ page }) => {
  // Use debug mode to skip onboarding entirely
  await page.goto('/?debug=true&name=Tester&starter=Grammander&locale=en-US');

  // Wait for game to start
  await page.waitForSelector('text=Tester', { timeout: 10000 });

  // Open menu
  await page.keyboard.press('Escape');

  // Check if menu title is visible
  const menuTitle = page.locator('h1', { hasText: /^MENU$/i });
  await expect(menuTitle).toBeVisible();

  // Test Spellingdex navigation
  await page.getByRole('button', { name: /Spellingdex/i }).click();
  await expect(page.getByText(/Alphabet Avenue/i).first()).toBeVisible();

  // Test return to main menu
  await page.locator('button', { hasText: '◀' }).click();
  await expect(page.getByRole('button', { name: /Spellingdex/i })).toBeVisible();

  // Test Settings navigation
  await page.getByRole('button', { name: /Settings/i }).click();
  await expect(page.getByText(/Language/i).first()).toBeVisible();

  // Test return to main menu
  await page.locator('button', { hasText: '◀' }).click();
  await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();

  // Final escape to close menu
  await page.keyboard.press('Escape');
  await expect(menuTitle).not.toBeVisible();
});
