#!/usr/bin/env node

import { chromium } from 'playwright';

async function testGamePlay() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`🖥️ ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(2000);
    
    // Click the first choice to start the game
    console.log('🎮 Starting game...');
    await page.click('#left-choice');
    await page.waitForTimeout(1000);
    
    // Play a few rounds to test the card system
    for (let i = 0; i < 10; i++) {
      const cardText = await page.textContent('#card-description');
      console.log(`Card ${i+1}: ${cardText?.substring(0, 80)}...`);
      
      // Randomly click left or right
      const choice = Math.random() > 0.5 ? '#left-choice' : '#right-choice';
      await page.click(choice);
      await page.waitForTimeout(800);
    }
    
    console.log('✅ Game test completed successfully!');
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testGamePlay();