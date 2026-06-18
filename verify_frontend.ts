import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });
  const page = await context.newPage();

  // Try to go directly to World Map
  console.log('Navigating to World Map via debug jump...');
  await page.goto('http://localhost:5174/?state=PLAY.WORLD');

  // Wait for the app to settle
  await page.waitForTimeout(3000);

  // Check if we are actually in the world (look for MapHUD or something)
  const isWorld = await page.evaluate(() => {
    return document.body.innerText.includes('WASD TO MOVE');
  });

  if (!isWorld) {
    console.log('Debug jump failed, manually navigating...');
    // If jump failed, we might be at LANGUAGE_SELECT or LANDING
    await page.click('button:has-text("English")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("Yes")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("START GAME")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("SLOT 1")').catch(() => {});
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'world_map.png' });
  console.log('World Map captured.');

  console.log('Opening Menu...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'menu.png' });
  console.log('Menu captured.');

  await browser.close();
})();
