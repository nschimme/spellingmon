import { test, expect } from '@playwright/test';

test.describe('Internationalization and TTS Flow', () => {
  test('should allow selecting a language and proceeding through audio check', async ({ page }) => {
    await page.goto('/');

    // 1. Landing Screen
    await page.getByRole('button', { name: /Start Game/i }).click();
    await page.getByRole('button', { name: /New Game/i }).click();

    // 2. Language Selection
    await expect(page.getByText(/Select Language/i)).toBeVisible();
    await page.getByText('Español').click();

    // 3. Audio Check
    // Language should have changed to Spanish
    await expect(page.getByText(/VERIFICACIÓN DE AUDIO/i)).toBeVisible();
    await page.getByRole('button', { name: /PROBAR VOZ/i }).click();
    await page.getByRole('button', { name: /Sí/i }).click();

    // 4. Character Creation
    await expect(page.getByText(/NUEVO ENTRENADOR/i)).toBeVisible();
    await page.getByPlaceholder(/Tu nombre/i).fill('Tester');
    await page.getByRole('button', { name: /Confirmar/i }).click();

    // 5. Starter Selection
    await expect(page.getByText(/Elige tu compañero/i)).toBeVisible();
  });
});
