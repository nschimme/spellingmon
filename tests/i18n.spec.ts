import { test, expect } from '@playwright/test';

test('Internationalization and TTS Flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Start Game/i }).click();

  // 1. Language Selection
  await expect(page.getByText('🇺🇸')).toBeVisible();
  await expect(page.getByText('🇲🇽')).toBeVisible();

  // Select Spanish
  await page.getByRole('button').filter({ hasText: /Español/i }).click();

  // 2. Audio Check Screen (Spanish)
  await expect(page.getByText(/Verificación de audio/i)).toBeVisible();
  await page.getByRole('button', { name: /Probar voz/i }).click();
  await page.getByRole('button', { name: /Sí/i }).click();

  // 3. Save Selection (Spanish) - Click empty slot starts immediately
  await page.locator('.relative.border-4.p-6').first().click();

  // 4. Character Creation (Spanish)
  await expect(page.getByText(/Creación de personaje/i)).toBeVisible();
  await page.getByPlaceholder(/Tu nombre/i).fill('Tester');
  await page.getByRole('button', { name: /Confirmar/i }).click();

  // 5. Starter Selection (Spanish)
  await expect(page.getByText(/Elige tu compañero/i)).toBeVisible();
});
