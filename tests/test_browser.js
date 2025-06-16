const { chromium } = require('playwright');

async function testGame() {
  console.log('🎮 Starting browser test of Eltern Simulator...\n');
  
  const browser = await chromium.launch({ headless: true }); // Headless for faster testing
  const page = await browser.newPage();
  
  // Set up console logging
  page.on('console', msg => {
    console.log('🖥️  Browser Console:', msg.text());
  });
  
  // Set up error logging
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('📖 Loading game page...');
    await page.goto('http://localhost:3000/?game=eltern_simulator', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for game elements to load
    console.log('⏳ Waiting for game elements...');
    await page.waitForSelector('#game-root', { timeout: 5000 });
    await page.waitForSelector('#powers', { timeout: 5000 });
    await page.waitForSelector('#card-container', { timeout: 5000 });
    
    console.log('✅ Game UI elements found');
    
    // Check if powers are displayed
    const powerElements = await page.$$('.power-container');
    console.log(`📊 Found ${powerElements.length} power bars`);
    
    // Check if intro card loaded
    const cardTitle = await page.textContent('.card-title');
    console.log(`🃏 Card title: "${cardTitle}"`);
    
    const cardDescription = await page.textContent('.card-description');
    console.log(`📝 Card description preview: "${cardDescription.substring(0, 50)}..."`);
    
    // Check if choice buttons are present
    const leftButton = await page.textContent('#left-choice');
    const rightButton = await page.textContent('#right-choice');
    console.log(`🔘 Left choice: "${leftButton}"`);
    console.log(`🔘 Right choice: "${rightButton}"`);
    
    // Test power values
    const powerValues = await page.$$eval('.power-value', elements => 
      elements.map(el => el.textContent)
    );
    console.log(`💪 Power values: ${powerValues.join(', ')}`);
    
    // Test clicking left choice
    console.log('\n🖱️  Testing left choice click...');
    await page.click('#left-choice');
    
    // Wait a moment for the game to process
    await page.waitForTimeout(1000);
    
    // Check if new card loaded
    const newCardTitle = await page.textContent('.card-title');
    console.log(`🃏 New card title: "${newCardTitle}"`);
    
    // Check if power values changed
    const newPowerValues = await page.$$eval('.power-value', elements => 
      elements.map(el => el.textContent)
    );
    console.log(`💪 New power values: ${newPowerValues.join(', ')}`);
    
    // Test several more clicks to trigger stories
    console.log('\n🎯 Testing story triggers...');
    for (let i = 0; i < 5; i++) {
      console.log(`Click ${i + 2}:`);
      await page.click('#right-choice');
      await page.waitForTimeout(500);
      
      const cardTitle = await page.textContent('.card-title');
      console.log(`  Card: "${cardTitle}"`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take a screenshot on failure
    await page.screenshot({ path: 'test_failure.png' });
    console.log('📸 Screenshot saved as test_failure.png');
  } finally {
    await browser.close();
  }
}

testGame();