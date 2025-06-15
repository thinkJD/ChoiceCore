#!/usr/bin/env node

import { chromium } from 'playwright';

async function testSimple() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => console.log(`🖥️  ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`Title: ${title}`);
    
    const hasGame = await page.locator('#game-container').count();
    console.log(`Game container found: ${hasGame > 0}`);
    
    if (hasGame === 0) {
      const bodyText = await page.textContent('body');
      console.log(`Body content: ${bodyText.substring(0, 500)}...`);
    }
    
  } catch (e) {
    console.log(`Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testSimple();