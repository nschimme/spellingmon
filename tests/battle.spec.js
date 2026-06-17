import { test, expect } from '@playwright/test';

test.describe('Battle System', () => {
  test('should initialize battle via debug query param', async ({ page }) => {
    await page.goto('/?debug=true&battle=true&name=Tester&starter=Grammander');

    // Check if battle UI is visible - look for the species names specifically
    await expect(page.getByText('Verminverb').first()).toBeVisible();
    await expect(page.getByText('Grammander').first()).toBeVisible();
  });

  test('should show spelling input when attack is selected', async ({ page }) => {
    await page.goto('/?debug=true&battle=true&name=Tester&starter=Grammander');

    const attackButton = page.getByRole('button', { name: /ATTACK/i });
    await expect(attackButton).toBeVisible();
    await attackButton.click();

    // Input should be visible
    const input = page.locator('input');
    await expect(input).toBeVisible();
  });

  test('should deal damage and show feedback on correct spelling', async ({ page }) => {
    // Use a word with a challenge (capital letter) to trigger Perfect feedback
    await page.goto('/?debug=true&battle=true&name=TestPlayer&starter=Grammander&word=apple');

    const input = page.locator('input');
    await expect(input).toBeVisible();

    await input.fill('apple');
    await page.keyboard.press('Enter');

    // Feedback should be visible - Use a more specific locator if needed, or wait longer
    await expect(page.getByText(/Dealt/i)).toBeVisible({ timeout: 10000 });
  });
});
