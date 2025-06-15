#!/usr/bin/env node

import { chromium } from 'playwright';

async function testNetwork() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to all network requests
  page.on('request', request => {
    console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    if (response.status() !== 200) {
      console.log(`❌ FAILED: ${response.status()} ${response.url()}`);
    }
  });
  
  page.on('console', msg => console.log(`🖥️ ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(3000);
    
    // Click the first choice to start the game
    console.log('🎮 Starting game...');
    await page.click('#left-choice');
    await page.waitForTimeout(5000);
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testNetwork();