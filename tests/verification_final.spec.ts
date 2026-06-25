import { test, expect } from '@playwright/test';

test('Trainer encounter has correct i18n display in battle', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:5173/?debug=true&state=PLAY.WORLD&starter=Squirtspell');

  // Wait for map to load
  await page.waitForTimeout(5000);

  // Find a trainer and move to them
  await page.evaluate(() => {
    const context = (window as any).__GAME_CONTEXT__;
    context.session.player.currentInterior = null;
    const trainers = context.map.currentMapData.trainers;
    const t = trainers[0];
    t.direction = 'up'; // Force direction for LOS
    context.session.updatePlayerPosition({ x: t.x, y: t.y - 3 });
  });

  // Walk into LOS
  await page.keyboard.press('ArrowDown');

  // Wait for dialog to appear and click through it
  // The dialog opens automatically after approach animation (~2s)
  const nextButton = page.locator('#dialog-next-button');
  await expect(nextButton).toBeVisible({ timeout: 20000 });

  // Click through all lines until dialog is gone
  while (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(500);
  }

  // Wait for transition to battle
  await page.waitForTimeout(5000);

  // Check state - should be in battle
  const state = await page.evaluate(() => (window as any).__FSM__.state.value);
  console.log('Final State:', state);

  // Take screenshot of battle
  await page.screenshot({ path: 'verification/battle_i18n_check.png' });

  // Verify battle log doesn't contain raw i18n keys
  const logContent = await page.evaluate(() => (window as any).__GAME_CONTEXT__.session.battle.log.join(' '));
  console.log('Battle Log:', logContent);

  expect(logContent).not.toContain('trainer.titles');
  expect(logContent).not.toContain('npc.rival');
  expect(logContent).toContain('Trainer');
});
