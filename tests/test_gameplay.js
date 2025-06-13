const { chromium } = require('playwright');

async function playGameSession() {
  console.log('🎮 Starting comprehensive gameplay test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 }); // Slow for observation
  const page = await browser.newPage();
  
  // Track game state
  let gameState = {
    cardsPlayed: 0,
    triggeredStories: new Set(),
    completedStories: new Set(),
    powerValues: {},
    cardHistory: []
  };
  
  // Set up console monitoring
  page.on('console', msg => {
    const text = msg.text();
    console.log('🖥️  Browser:', text);
    
    // Parse game state from console logs
    if (text.includes('Cards played:')) {
      gameState.cardsPlayed = parseInt(text.split(':')[1]);
    }
    if (text.includes('Triggered stories:')) {
      const stories = text.split(':')[1].trim();
      if (stories) {
        gameState.triggeredStories = new Set(stories.split(','));
      }
    }
    if (text.includes('Completed stories:')) {
      const stories = text.split(':')[1].trim();
      if (stories) {
        gameState.completedStories = new Set(stories.split(','));
      }
    }
  });

  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForSelector('#game-root');
    
    console.log('✅ Game loaded successfully\n');
    
    // Play 15 rounds to trigger multiple stories
    for (let round = 1; round <= 15; round++) {
      console.log(`\n📖 Round ${round}:`);
      
      // Get current card info
      const cardInfo = await page.evaluate(() => {
        const title = document.querySelector('.card-title')?.textContent || 'unknown';
        const description = document.querySelector('.card-description')?.textContent || '';
        const leftChoice = document.getElementById('left-choice')?.textContent || '';
        const rightChoice = document.getElementById('right-choice')?.textContent || '';
        
        // Get current power values
        const powerValues = {};
        document.querySelectorAll('.power-value').forEach((el, i) => {
          const powerNames = ['geld', 'kinder_glueck', 'eltern_nerven', 'kinder_gesundheit'];
          if (powerNames[i]) {
            powerValues[powerNames[i]] = parseInt(el.textContent);
          }
        });
        
        return { title, description: description.substring(0, 60) + '...', leftChoice, rightChoice, powerValues };
      });
      
      console.log(`  🃏 Card: "${cardInfo.title}"`);
      console.log(`  📝 Description: "${cardInfo.description}"`);
      console.log(`  ⬅️  Left: "${cardInfo.leftChoice}"`);
      console.log(`  ➡️  Right: "${cardInfo.rightChoice}"`);
      console.log(`  💪 Powers: Geld=${cardInfo.powerValues.geld}, Glück=${cardInfo.powerValues.kinder_glueck}, Nerven=${cardInfo.powerValues.eltern_nerven}, Gesundheit=${cardInfo.powerValues.kinder_gesundheit}`);
      
      gameState.cardHistory.push(cardInfo.title);
      gameState.powerValues = cardInfo.powerValues;
      
      // Check for story expectations
      const expectedStories = [];
      if (gameState.cardsPlayed >= 1 && !gameState.triggeredStories.has('morgen_routine')) {
        expectedStories.push('morgen_routine (after 1 card)');
      }
      if (gameState.cardsPlayed >= 2 && !gameState.triggeredStories.has('schlangen_abenteuer')) {
        expectedStories.push('schlangen_abenteuer (after 2 cards)');
      }
      if (gameState.cardsPlayed >= 5 && !gameState.triggeredStories.has('kindergeburtstag')) {
        expectedStories.push('kindergeburtstag (after 5 cards)');
      }
      
      if (expectedStories.length > 0) {
        console.log(`  ⏳ Expected stories: ${expectedStories.join(', ')}`);
      }
      
      // Randomly choose left or right (but prefer variety)
      const choice = Math.random() > 0.5 ? 'left' : 'right';
      const buttonId = choice === 'left' ? '#left-choice' : '#right-choice';
      
      console.log(`  🖱️  Choosing: ${choice}`);
      
      // Test hover preview before clicking
      await page.hover(buttonId);
      await page.waitForTimeout(500);
      
      const previewInfo = await page.evaluate(() => {
        const previews = Array.from(document.querySelectorAll('.power-preview.visible'));
        return previews.map(p => p.textContent).filter(t => t).join(', ');
      });
      
      if (previewInfo) {
        console.log(`  👁️  Preview: ${previewInfo}`);
      }
      
      // Click the choice
      await page.click(buttonId);
      await page.waitForTimeout(1000);
      
      // Check for game over
      const isGameOver = await page.evaluate(() => {
        return document.querySelector('.game-over') !== null;
      });
      
      if (isGameOver) {
        console.log(`  💀 Game Over after ${round} rounds!`);
        
        const finalPowers = await page.evaluate(() => {
          const powerValues = {};
          document.querySelectorAll('.power-value').forEach((el, i) => {
            const powerNames = ['geld', 'kinder_glueck', 'eltern_nerven', 'kinder_gesundheit'];
            if (powerNames[i]) {
              powerValues[powerNames[i]] = parseInt(el.textContent);
            }
          });
          return powerValues;
        });
        
        console.log(`  📊 Final powers: ${JSON.stringify(finalPowers)}`);
        break;
      }
      
      // Print current game state
      console.log(`  📈 Game state: ${gameState.cardsPlayed} cards, ${gameState.triggeredStories.size} stories triggered, ${gameState.completedStories.size} completed`);
      
      // Check for story cards
      const isStoryCard = ['morgen_stress', 'hausaufgaben_drama', 'schlange_wunsch', 'schlangen_begegnung', 'geburtstag_planung', 'party_ort', 'geschenke_dilemma'].includes(cardInfo.title);
      if (isStoryCard) {
        console.log(`  🎬 Story card detected: ${cardInfo.title}`);
      }
    }
    
    // Final analysis
    console.log('\n📊 Final Game Analysis:');
    console.log(`  Total cards played: ${gameState.cardsPlayed}`);
    console.log(`  Stories triggered: ${Array.from(gameState.triggeredStories).join(', ') || 'none'}`);
    console.log(`  Stories completed: ${Array.from(gameState.completedStories).join(', ') || 'none'}`);
    console.log(`  Card sequence: ${gameState.cardHistory.slice(-10).join(' → ')}`);
    console.log(`  Final powers: ${JSON.stringify(gameState.powerValues)}`);
    
    // Validate story logic
    console.log('\n🔍 Story Logic Validation:');
    
    if (gameState.cardsPlayed >= 1) {
      const hasEarlyStory = gameState.triggeredStories.has('morgen_routine');
      console.log(`  ✅ Story after 1 card: ${hasEarlyStory ? 'TRIGGERED' : '❌ MISSING'}`);
    }
    
    if (gameState.cardsPlayed >= 2) {
      const hasSnakeStory = gameState.triggeredStories.has('schlangen_abenteuer');
      console.log(`  ✅ Story after 2 cards: ${hasSnakeStory ? 'TRIGGERED' : '❌ MISSING'}`);
    }
    
    if (gameState.cardsPlayed >= 5) {
      const hasBirthdayStory = gameState.triggeredStories.has('kindergeburtstag');
      console.log(`  ✅ Story after 5 cards: ${hasBirthdayStory ? 'TRIGGERED' : '❌ MISSING'}`);
    }
    
    // Check for story card appearances
    const storyCardsFound = gameState.cardHistory.filter(card => 
      ['morgen_stress', 'hausaufgaben_drama', 'schlange_wunsch', 'schlangen_begegnung', 'geburtstag_planung', 'party_ort', 'geschenke_dilemma'].includes(card)
    );
    
    console.log(`  🎭 Story cards appeared: ${storyCardsFound.join(', ') || 'none'}`);
    
    await page.waitForTimeout(3000); // Let user see final state
    
  } catch (error) {
    console.error('❌ Gameplay test failed:', error.message);
    await page.screenshot({ path: 'gameplay_error.png' });
  } finally {
    await browser.close();
  }
}

playGameSession();