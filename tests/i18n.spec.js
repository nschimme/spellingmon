import { test, expect } from '@playwright/test';

test('Internationalization and TTS Flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Start Game');
  await page.click('text=New Game');

  // Verify presence of flag emojis in language selection
  await expect(page.getByText('🇺🇸')).toBeVisible();
  await expect(page.getByText('🇲🇽')).toBeVisible();

  // Select Spanish
  await page.getByRole('button').filter({ hasText: /Español/i }).click();

  // Audio Check Screen (Spanish)
  await expect(page.getByText(/Verificación de audio/i)).toBeVisible();
  await page.getByRole('button', { name: /Probar voz/i }).click();
  await page.getByRole('button', { name: /Sí/i }).click();

  // Character Creation (Spanish)
  await expect(page.getByText(/Creación de personaje/i)).toBeVisible();
  await page.getByPlaceholder(/Tu nombre/i).fill('Tester');
  await page.getByRole('button', { name: /Confirmar/i }).click();

  // Starter Selection (Spanish)
  await expect(page.getByText(/Elige tu compañero/i)).toBeVisible();
});
