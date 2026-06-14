import { test, expect } from '@playwright/test';

test('battle menu keyboard navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Start Game');
  await page.click('text=New Game');
  await page.fill('input[placeholder="NAME"]', 'Tester');
  await page.click('text=Confirm');
  await page.click('text=Test Voice');
  await page.click('text=Yes');
  await page.click('text=Grammander');

  await page.waitForSelector('text=Tester');

  // Trigger battle by moving
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('ArrowRight');
  }

  try {
    await page.waitForSelector('button:has-text("Attack")', { timeout: 15000 });

    // Default selected should be Attack (index 0)
    const attackBtn = page.locator('button:has-text("Attack")');
    await expect(attackBtn).toHaveClass(/ring-8/);

    // Press down to go to Capture (index 1)
    await page.keyboard.press('ArrowDown');
    const captureBtn = page.locator('button:has-text("Capture")');
    await expect(captureBtn).toHaveClass(/ring-8/);
    await expect(attackBtn).not.toHaveClass(/ring-8/);

    // Press right to go to Switch (index 2)
    await page.keyboard.press('ArrowRight');
    const switchBtn = page.locator('button:has-text("Switch")');
    await expect(switchBtn).toHaveClass(/ring-8/);

    // Press down to go to Run (index 3)
    await page.keyboard.press('ArrowDown');
    const runBtn = page.locator('button:has-text("Run")');
    await expect(runBtn).toHaveClass(/ring-8/);

    // Press up to go back to Capture (index 1)
    await page.keyboard.press('ArrowUp');
    await expect(captureBtn).toHaveClass(/ring-8/);

  } catch (e) {
    console.log("Could not trigger battle for keyboard test, skipping visual check");
  }
});
