const { chromium } = require('playwright');

async function visualTest() {
  console.log('📱 Testing visual layout...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test different viewport sizes
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'Desktop Small' }
  ];
  
  for (let viewport of viewports) {
    console.log(`\n📏 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    await page.setViewportSize(viewport);
    await page.goto('http://localhost:3000/?game=eltern_simulator');
    await page.waitForSelector('#game-root');
    
    // Check if scrolling is needed
    const gameRootHeight = await page.evaluate(() => {
      const gameRoot = document.getElementById('game-root');
      return gameRoot.scrollHeight;
    });
    
    const viewportHeight = viewport.height;
    const needsScrolling = gameRootHeight > viewportHeight * 0.95;
    
    console.log(`  Game height: ${gameRootHeight}px`);
    console.log(`  Viewport height: ${viewportHeight}px`);
    console.log(`  Needs scrolling: ${needsScrolling ? '❌ YES' : '✅ NO'}`);
    
    // Take a screenshot
    await page.screenshot({ 
      path: `layout_${viewport.name.replace(' ', '_').toLowerCase()}.png`,
      fullPage: false
    });
    console.log(`  📸 Screenshot saved: layout_${viewport.name.replace(' ', '_').toLowerCase()}.png`);
  }
  
  await browser.close();
  console.log('\n✅ Visual testing complete!');
}

visualTest();