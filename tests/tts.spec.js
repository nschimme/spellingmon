import { test, expect } from '@playwright/test';

test.describe('TTS Verification Flow', () => {
  test('should show TTS verification screen after starting game and proceed after verification', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/');

    // 1. Landing Screen
    const startButton = page.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const newGameButton = page.getByRole('button', { name: 'New Game' });
    await expect(newGameButton).toBeVisible();
    await newGameButton.click();

    // 1b. Character Creation
    await page.getByPlaceholder('NAME').fill('Test Player');
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 2. TTS Welcome Screen
    await expect(page.getByText('Audio Check')).toBeVisible();
    await expect(page.getByText('Did you hear the voice?')).not.toBeVisible();

    const testVoiceButton = page.getByRole('button', { name: 'Test Voice' });
    await testVoiceButton.click();

    // After clicking test voice, "Did you hear the voice?" should appear
    // Increase timeout because speech.init(true) can take up to 5s
    await expect(page.getByText('Did you hear the voice?')).toBeVisible({ timeout: 10000 });

    // Verify "Yes" button works
    const yesButton = page.getByRole('button', { name: 'Yes' });
    await yesButton.click();

    // 3. Starter Selection (Game should have proceeded)
    await expect(page.getByText('Choose your partner!')).toBeVisible();
  });

  test('should show troubleshooting when clicking No', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await page.getByRole('button', { name: 'New Game' }).click();

    await page.getByPlaceholder('NAME').fill('Test Player');
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.getByRole('button', { name: 'Test Voice' }).click();
    await page.getByRole('button', { name: 'No' }).click();

    await expect(page.getByText('Troubleshooting:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reload Voices' })).toBeVisible();
  });
});
