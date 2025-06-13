const { chromium } = require('playwright');

async function debugHover() {
  console.log('🔍 Debug hover preview functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('🖥️  Browser:', msg.text()));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForSelector('#game-root');
    
    // Add debug logging to the page
    await page.evaluate(() => {
      window.debugHover = true;
      
      // Override console.log to see what's happening
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog('[DEBUG]', ...args);
      };
    });
    
    // Test card data
    const cardData = await page.evaluate(() => {
      // Try to access the current card data
      const leftButton = document.getElementById('left-choice');
      const rightButton = document.getElementById('right-choice');
      
      console.log('Left button text:', leftButton?.textContent);
      console.log('Right button text:', rightButton?.textContent);
      
      // Check if preview elements exist
      const previews = document.querySelectorAll('.power-preview');
      console.log('Number of preview elements:', previews.length);
      
      previews.forEach((el, i) => {
        console.log(`Preview ${i}: id=${el.id}, text="${el.textContent}"`);
      });
      
      return {
        leftText: leftButton?.textContent,
        rightText: rightButton?.textContent,
        previewCount: previews.length
      };
    });
    
    console.log('Card data:', cardData);
    
    // Test hover with debug
    console.log('\n🖱️ Testing hover with debug...');
    await page.hover('#left-choice');
    await page.waitForTimeout(2000);
    
    await page.hover('#card-container');
    await page.waitForTimeout(1000);
    
    await page.hover('#right-choice');
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugHover();