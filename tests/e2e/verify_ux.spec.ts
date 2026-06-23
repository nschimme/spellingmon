import { test, expect } from '@playwright/test';

test('verify mobile controls and battle input', async ({ page }) => {
  // Go to a state where controls are visible (World Map)
  await page.goto('http://localhost:5173/?state=PLAY.WORLD_MAP');
  await page.waitForSelector('.fixed.bottom-8.right-8'); // Mobile controls
  await page.screenshot({ path: 'verification/mobile_controls.png' });

  // Go to battle to check input focus
  await page.goto('http://localhost:5173/?state=PLAY.BATTLE&word=Test');
  await page.waitForSelector('button:has-text("Attack")');
  await page.click('button:has-text("Attack")');

  // Wait for input focus logic to run
  await page.waitForTimeout(500);

  const isFocused = await page.evaluate(() => {
    return document.activeElement?.tagName === 'INPUT';
  });
  console.log('Input focused after Attack:', isFocused);

  await page.screenshot({ path: 'verification/battle_input.png' });
});
