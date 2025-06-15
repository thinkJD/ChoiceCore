#!/usr/bin/env node

import { chromium } from 'playwright';

async function testDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`🖥️ ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(3000);
    
    // Click the first choice to start the game
    console.log('🎮 Starting game...');
    await page.click('#left-choice');
    await page.waitForTimeout(2000);
    
    // Check what's on the page now
    const gameHTML = await page.innerHTML('#game-container');
    console.log('Game HTML:', gameHTML.substring(0, 500));
    
    // Check if card elements exist
    const cardDesc = await page.locator('#card-description').count();
    const leftChoice = await page.locator('#left-choice').count();
    const rightChoice = await page.locator('#right-choice').count();
    
    console.log(`Card description elements: ${cardDesc}`);
    console.log(`Left choice elements: ${leftChoice}`);
    console.log(`Right choice elements: ${rightChoice}`);
    
    if (cardDesc > 0) {
      const text = await page.textContent('#card-description');
      console.log(`Card text: ${text}`);
    }
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testDebug();