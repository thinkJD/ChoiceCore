#!/usr/bin/env node

import { chromium } from 'playwright';

async function testStoryFlow() {
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
    
    // Play several rounds to find a story trigger card
    for (let i = 0; i < 5; i++) {
      try {
        const cardDesc = await page.textContent('#card-description', { timeout: 5000 });
        const leftLabel = await page.textContent('#left-choice');
        const rightLabel = await page.textContent('#right-choice');
        
        console.log(`\n--- Card ${i+1} ---`);
        console.log(`Description: ${cardDesc?.substring(0, 100)}...`);
        console.log(`Left: ${leftLabel}`);
        console.log(`Right: ${rightLabel}`);
        
        // Look for story acceptance keywords
        if (leftLabel?.includes('Ruhig bleiben') || leftLabel?.includes('Kind mitnehmen') || leftLabel?.includes('Gro')) {
          console.log('🎯 Found potential story trigger! Clicking left to accept story...');
          await page.click('#left-choice');
          await page.waitForTimeout(2000);
          console.log('✅ Story should be accepted now');
          break;
        } else {
          // Click right to continue
          await page.click('#right-choice');
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`Error on card ${i+1}: ${e.message}`);
        break;
      }
    }
    
    // Play a few more rounds to see if story cards appear
    console.log('\n🔄 Playing more rounds to see story cards...');
    for (let i = 0; i < 5; i++) {
      try {
        const cardDesc = await page.textContent('#card-description', { timeout: 5000 });
        console.log(`Story Card ${i+1}: ${cardDesc?.substring(0, 80)}...`);
        
        const choice = Math.random() > 0.5 ? '#left-choice' : '#right-choice';
        await page.click(choice);
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(`Error on story card ${i+1}: ${e.message}`);
        break;
      }
    }
    
    console.log('✅ Story flow test completed!');
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  } finally {
    await browser.close();
  }
}

testStoryFlow();