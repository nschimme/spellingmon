import { test, expect } from '@playwright/test';

test('Trainer encounter has correct i18n display in battle', async ({ page }) => {
  await page.goto('http://localhost:5173/?debug=true&state=PLAY.WORLD&starter=Squirtspell');

  // Wait for map to load
  await page.waitForTimeout(5000);

  // Find a trainer and move to them
  await page.evaluate(() => {
    const context = (window as any).__GAME_CONTEXT__;
    context.session.player.currentInterior = null;
    const trainers = context.map.currentMapData.trainers;
    const t = trainers[0];
    context.session.updatePlayerPosition({ x: t.x, y: t.y - 3 });
  });

  // Walk into LOS
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');

  // Wait for approach, dialogue, and transition to battle (Total ~10s)
  await page.waitForTimeout(12000);

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
  expect(logContent).toContain('Trainer'); // Usually starts with "Trainer [Title] [Name] wants to battle"
});
