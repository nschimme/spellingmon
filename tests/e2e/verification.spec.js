import { test, expect } from '@playwright/test';

test('Spellingdex and Full-Screen Menu Verification', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/jules/verification/1_landing.png' });

  // 1. Landing Screen: Start Game
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/2_save_options.png' });

  // 2. Landing Screen: New Game
  await page.click('button:has-text("New Game")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/3_char_creation.png' });

  // 3. Character Creation: Fill Name and Confirm
  await page.fill('input', 'Jules');
  await page.click('button:has-text("CONFIRM")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/4_tts_check.png' });

  // 4. TTS Check: Test Voice
  await page.click('button:has-text("Test Voice")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/5_tts_tested.png' });

  // 5. TTS Check: Yes
  await page.click('button:has-text("Yes")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/6_starter_selection.png' });

  // 6. Starter Selection: Choose Fire
  // In StarterSelection.vue, there is no "Choose" button, clicking the mon selects it immediately.
  await page.click('text=🔥');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/home/jules/verification/7_world_map.png' });

  // 7. Open Menu using Escape key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/8_menu_fullscreen.png' });

  // 8. Go to Spellingdex
  await page.click('button:has-text("Spellingdex")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/9_spellingdex.png' });

  // 9. Check Map tab
  await page.click('button:has-text("Map")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/10_menu_map.png' });
});
