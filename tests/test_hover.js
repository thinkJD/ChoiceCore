const { chromium } = require('playwright');

async function testHover() {
  console.log('🖱️ Testing hover preview functionality...');
  
  const browser = await chromium.launch({ headless: false }); // Visual test
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForSelector('#game-root');
    
    console.log('✅ Game loaded');
    
    // Test hovering over left button
    console.log('\n🔍 Testing left button hover...');
    await page.hover('#left-choice');
    await page.waitForTimeout(1000); // Give time to see the effect
    
    // Check if preview elements are visible
    const previewVisible = await page.evaluate(() => {
      const previews = document.querySelectorAll('.power-preview.visible');
      return previews.length > 0;
    });
    
    console.log(`Preview elements visible: ${previewVisible ? '✅ YES' : '❌ NO'}`);
    
    // Move away from button
    await page.hover('#card-container');
    await page.waitForTimeout(500);
    
    // Test hovering over right button
    console.log('\n🔍 Testing right button hover...');
    await page.hover('#right-choice');
    await page.waitForTimeout(1000);
    
    // Check preview again
    const previewVisible2 = await page.evaluate(() => {
      const previews = document.querySelectorAll('.power-preview.visible');
      return previews.length > 0;
    });
    
    console.log(`Preview elements visible: ${previewVisible2 ? '✅ YES' : '❌ NO'}`);
    
    // Take a screenshot of the hover effect
    await page.screenshot({ path: 'hover_preview.png' });
    console.log('📸 Screenshot saved: hover_preview.png');
    
    console.log('\n✅ Hover test completed. Check the browser window to see the effects!');
    
    // Keep browser open for 5 seconds to see the effect
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Hover test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testHover();