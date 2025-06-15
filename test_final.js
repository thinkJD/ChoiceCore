#!/usr/bin/env node

import { chromium } from 'playwright';

async function testFinal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`🖥️ ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ ERROR: ${error.message}`));
  
  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForTimeout(3000);
    
    console.log('🎮 Starting game...');
    await page.click('#left-choice');
    await page.waitForTimeout(1000);
    
    // Play several rounds to test the new story system
    for (let i = 0; i < 8; i++) {
      try {
        const cardDesc = await page.textContent('.card-description', { timeout: 5000 });
        const leftLabel = await page.textContent('#left-choice');
        const rightLabel = await page.textContent('#right-choice');
        
        console.log(`\n--- Card ${i+1} ---`);
        console.log(`Description: ${cardDesc?.substring(0, 80)}...`);
        console.log(`Left: ${leftLabel}`);
        console.log(`Right: ${rightLabel}`);
        
        // Look for story trigger cards by their descriptions
        if (cardDesc?.includes('7:00 Uhr morgens') || 
            cardDesc?.includes('Supermarkt-Besuch') ||
            cardDesc?.includes('6. Geburtstag') ||
            cardDesc?.includes('39°C Fieber') ||
            cardDesc?.includes('14 Jahre alt') ||
            cardDesc?.includes('Geburtstagseinladung') ||
            cardDesc?.includes('Kita')) {
          console.log('🎯 Found story trigger card! Accepting story...');
          await page.click('#left-choice');
          await page.waitForTimeout(2000);
        } else {
          // Randomly choose left or right
          const choice = Math.random() > 0.5 ? '#left-choice' : '#right-choice';
          await page.click(choice);
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`Error on card ${i+1}: ${e.message}`);
        break;
      }
    }
    
    console.log('✅ Final test completed successfully!');
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testFinal();