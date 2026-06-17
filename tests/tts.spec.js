import { test, expect } from '@playwright/test';

test.describe('TTS Verification Flow', () => {
  test('should show TTS verification screen after starting game and proceed after verification', async ({ page }) => {
    await page.goto('/');

    // 1. Landing Screen
    const startButton = page.getByRole('button', { name: /Start Game/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 2. Language Selection
    await page.getByRole('button').filter({ hasText: /English/i }).click();

    // 3. Audio Check
    const testVoiceButton = page.getByRole('button', { name: /Test Voice/i });
    await expect(testVoiceButton).toBeVisible();
    await testVoiceButton.click();

    const yesButton = page.getByRole('button', { name: /Yes/i });
    await expect(yesButton).toBeVisible();
    await yesButton.click();

    // 4. Save Selection
    await page.locator('.relative.border-4.p-6').first().click();
    const newGameButton = page.getByRole('button', { name: /Start/i });
    await expect(newGameButton).toBeVisible();
    await newGameButton.click();

    // 5. Character Creation
    await expect(page.getByText(/Character Creation/i)).toBeVisible();
    await page.getByPlaceholder(/Enter your name/i).fill('Tester');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // 6. Starter Selection
    await expect(page.getByText(/Choose your partner/i)).toBeVisible();
  });

  test('should show troubleshooting when clicking No', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start Game/i }).click();
    await page.getByRole('button').filter({ hasText: /English/i }).click();

    const testVoiceButton = page.getByRole('button', { name: /Test Voice/i });
    await testVoiceButton.click();

    const noButton = page.getByRole('button', { name: /No/i });
    await expect(noButton).toBeVisible();
    await noButton.click();

    await expect(page.getByText(/Troubleshooting:/i)).toBeVisible();
  });
});
