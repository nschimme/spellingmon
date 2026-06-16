import { test, expect } from '@playwright/test';

test.describe('Battle System', () => {
  test('should initialize battle via debug query param', async ({ page }) => {
    await page.goto('/?debug=true&battle=true&name=TestPlayer&starter=Grammander');

    const enemyName = page.locator('span:has-text("VERMINVERB")');
    await expect(enemyName).toBeVisible();

    const playerName = page.locator('span:has-text("GRAMMANDER")');
    await expect(playerName).toBeVisible();

    const attackButton = page.locator('button:has-text("ATTACK")');
    await expect(attackButton).toBeVisible();
  });

  test('should show spelling input when attack is selected', async ({ page }) => {
    await page.goto('/?debug=true&battle=true&name=TestPlayer&starter=Grammander');

    const attackButton = page.locator('button:has-text("ATTACK")');
    await attackButton.click();

    // Input should be visible. In templates it's usually uppercase placeholder
    const input = page.locator('input');
    await expect(input).toBeVisible();
  });

  test('should deal damage and show feedback on correct spelling', async ({ page }) => {
    // Use the new &word= debug param to ensure we know the correct word
    await page.goto('/?debug=true&battle=true&name=TestPlayer&starter=Grammander&word=APPLE');

    // Input should already be visible due to phase=spelling in debugInit
    const input = page.locator('input');
    await expect(input).toBeVisible();

    await input.fill('APPLE');
    await page.keyboard.press('Enter');

    // Should show "Perfect!" or "Correct!" feedback
    // In templates it's $t('battle.perfect') -> "PERFECT!"
    const perfectFeedback = page.locator('p:has-text("PERFECT")');
    await expect(perfectFeedback).toBeVisible();
  });
});
