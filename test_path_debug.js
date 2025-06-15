#!/usr/bin/env node

import { chromium } from 'playwright';

async function testPathDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to specific failed requests
  page.on('response', response => {
    if (response.status() === 404) {
      console.log(`❌ 404 ERROR: ${response.url()}`);
    }
  });
  
  page.on('console', msg => console.log(`🖥️ ${msg.type()}: ${msg.text()}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(3000);
    
    // Click the first choice to start the game
    console.log('🎮 Starting game...');
    await page.click('#left-choice');
    await page.waitForTimeout(2000);
    
    // Check if the image src is being set correctly
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs).map(img => ({ src: img.src, alt: img.alt }));
    });
    
    console.log('Images found:', images);
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testPathDebug();