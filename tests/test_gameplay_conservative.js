const { chromium } = require('playwright');

async function playConservativeSession() {
  console.log('🎮 Playing conservative session to see more story logic...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const page = await browser.newPage();
  
  let gameState = {
    cardsPlayed: 0,
    triggeredStories: new Set(),
    completedStories: new Set(),
    powerValues: {},
    cardHistory: []
  };
  
  page.on('console', msg => {
    const text = msg.text();
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
    
    console.log('✅ Game loaded\n');
    
    // Play more conservatively to avoid game over
    for (let round = 1; round <= 20; round++) {
      const cardInfo = await page.evaluate(() => {
        const title = document.querySelector('.card-title')?.textContent || 'unknown';
        const description = document.querySelector('.card-description')?.textContent || '';
        const leftChoice = document.getElementById('left-choice')?.textContent || '';
        const rightChoice = document.getElementById('right-choice')?.textContent || '';
        
        const powerValues = {};
        document.querySelectorAll('.power-value').forEach((el, i) => {
          const powerNames = ['geld', 'kinder_glueck', 'eltern_nerven', 'kinder_gesundheit'];
          if (powerNames[i]) {
            powerValues[powerNames[i]] = parseInt(el.textContent);
          }
        });
        
        return { title, description: description.substring(0, 50) + '...', leftChoice, rightChoice, powerValues };
      });
      
      console.log(`Round ${round}: "${cardInfo.title}"`);
      console.log(`  Powers: G=${cardInfo.powerValues.geld}, K=${cardInfo.powerValues.kinder_glueck}, N=${cardInfo.powerValues.eltern_nerven}, H=${cardInfo.powerValues.kinder_gesundheit}`);
      
      gameState.cardHistory.push(cardInfo.title);
      gameState.powerValues = cardInfo.powerValues;
      
      // Make conservative choices to avoid extremes
      let choice = 'right'; // Default to right
      
      // If powers are getting low, choose more conservatively
      if (cardInfo.powerValues.geld < 100) choice = 'left'; // Need money
      if (cardInfo.powerValues.eltern_nerven < 30) choice = 'right'; // Need nerves
      if (cardInfo.powerValues.kinder_glueck < 30) choice = 'left'; // Need happiness
      if (cardInfo.powerValues.kinder_gesundheit < 30) choice = 'right'; // Need health
      
      // Special handling for story cards
      const storyCards = ['morgen_stress', 'hausaufgaben_drama', 'schlange_wunsch', 'schlangen_begegnung', 'geburtstag_planung', 'party_ort', 'geschenke_dilemma'];
      if (storyCards.includes(cardInfo.title)) {
        console.log(`  🎬 STORY CARD: ${cardInfo.title}`);
        
        // Check which story this belongs to
        if (['morgen_stress', 'hausaufgaben_drama'].includes(cardInfo.title)) {
          console.log(`    📖 Part of: morgen_routine story`);
        }
        if (['schlange_wunsch', 'schlangen_begegnung'].includes(cardInfo.title)) {
          console.log(`    🐍 Part of: schlangen_abenteuer story`);
        }
        if (['geburtstag_planung', 'party_ort', 'geschenke_dilemma'].includes(cardInfo.title)) {
          console.log(`    🎉 Part of: kindergeburtstag story`);
        }
      }
      
      const buttonId = choice === 'left' ? '#left-choice' : '#right-choice';
      console.log(`  → Choosing: ${choice} ("${choice === 'left' ? cardInfo.leftChoice : cardInfo.rightChoice}")`);
      
      await page.click(buttonId);
      await page.waitForTimeout(800);
      
      // Check for game over
      const isGameOver = await page.evaluate(() => {
        return document.querySelector('.game-over') !== null;
      });
      
      if (isGameOver) {
        console.log(`\n💀 Game Over after ${round} rounds!`);
        break;
      }
      
      // Print story status every few rounds
      if (round % 3 === 0) {
        console.log(`  📊 Stories: Triggered=${Array.from(gameState.triggeredStories).join(',') || 'none'}, Completed=${Array.from(gameState.completedStories).join(',') || 'none'}`);
      }
    }
    
    console.log('\n📈 Final Analysis:');
    console.log(`Cards played: ${gameState.cardsPlayed}`);
    console.log(`Stories triggered: ${Array.from(gameState.triggeredStories).join(', ')}`);
    console.log(`Stories completed: ${Array.from(gameState.completedStories).join(', ')}`);
    
    // Analyze story sequence
    const storyCardSequence = gameState.cardHistory.filter(card => 
      ['morgen_stress', 'hausaufgaben_drama', 'schlange_wunsch', 'schlangen_begegnung', 'geburtstag_planung', 'party_ort', 'geschenke_dilemma'].includes(card)
    );
    console.log(`Story card sequence: ${storyCardSequence.join(' → ')}`);
    
    // Check story completion logic
    if (storyCardSequence.includes('hausaufgaben_drama')) {
      console.log(`✅ morgen_routine story should be completed (last card: hausaufgaben_drama)`);
    }
    if (storyCardSequence.includes('schlangen_begegnung')) {
      console.log(`✅ schlangen_abenteuer story should be completed (last card: schlangen_begegnung)`);
    }
    if (storyCardSequence.includes('geschenke_dilemma')) {
      console.log(`✅ kindergeburtstag story should be completed (last card: geschenke_dilemma)`);
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

playConservativeSession();