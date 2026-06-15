import { test, expect } from '@playwright/test';

test.describe('TTS Verification Flow', () => {
  test('should show TTS verification screen after starting game and proceed after verification', async ({ page }) => {
    await page.goto('/');

    // 1. Landing Screen
    const startButton = page.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const newGameButton = page.getByRole('button', { name: 'New Game' });
    await expect(newGameButton).toBeVisible();
    await newGameButton.click();

    // 2. Language Selection
    await page.getByRole('button').filter({ hasText: 'English' }).click();

    // 3. Audio Check
    const testVoiceButton = page.getByRole('button', { name: 'Test Voice' });
    await expect(testVoiceButton).toBeVisible();
    await testVoiceButton.click();

    const yesButton = page.getByRole('button', { name: 'Yes' });
    await expect(yesButton).toBeVisible();
    await yesButton.click();

    // 4. Character Creation
    await expect(page.getByText('New Trainer')).toBeVisible();
    await page.getByPlaceholder('Enter your name').fill('Tester');
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 5. Starter Selection
    await expect(page.getByText('Choose your partner')).toBeVisible();
  });

  test('should show troubleshooting when clicking No', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start Game');
    await page.click('text=New Game');
    await page.getByRole('button').filter({ hasText: 'English' }).click();

    const testVoiceButton = page.getByRole('button', { name: 'Test Voice' });
    await testVoiceButton.click();

    const noButton = page.getByRole('button', { name: 'No' });
    await expect(noButton).toBeVisible();
    await noButton.click();

    await expect(page.getByText('Troubleshooting')).toBeVisible();
  });
});
