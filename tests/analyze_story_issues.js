const { chromium } = require('playwright');

async function analyzeStoryIssues() {
  console.log('🔍 Analyzing story logic issues...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let issues = [];
  let storyTracker = {
    triggered: new Set(),
    completed: new Set(),
    cardSequence: [],
    duplicateCards: []
  };
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Triggered stories:')) {
      const stories = text.split(':')[1].trim();
      if (stories) {
        storyTracker.triggered = new Set(stories.split(','));
      }
    }
    if (text.includes('Completed stories:')) {
      const stories = text.split(':')[1].trim();
      if (stories) {
        storyTracker.completed = new Set(stories.split(','));
      }
    }
  });

  try {
    await page.goto('http://localhost:8002/?game=eltern_simulator');
    await page.waitForSelector('#game-root');
    
    // Play 12 rounds and track issues
    for (let round = 1; round <= 12; round++) {
      const cardInfo = await page.evaluate(() => {
        const title = document.querySelector('.card-title')?.textContent || 'unknown';
        const powerValues = {};
        document.querySelectorAll('.power-value').forEach((el, i) => {
          const powerNames = ['geld', 'kinder_glueck', 'eltern_nerven', 'kinder_gesundheit'];
          if (powerNames[i]) {
            powerValues[powerNames[i]] = parseInt(el.textContent);
          }
        });
        return { title, powerValues };
      });
      
      // Track card sequence and check for duplicates
      if (storyTracker.cardSequence.includes(cardInfo.title)) {
        storyTracker.duplicateCards.push(`${cardInfo.title} (round ${round})`);
        issues.push(`ISSUE: Card "${cardInfo.title}" appeared multiple times`);
      }
      storyTracker.cardSequence.push(cardInfo.title);
      
      // Check story logic expectations
      if (round === 2 && !storyTracker.triggered.has('morgen_routine')) {
        issues.push(`ISSUE: morgen_routine should trigger after card 1, but didn't by round ${round}`);
      }
      if (round === 3 && !storyTracker.triggered.has('schlangen_abenteuer')) {
        issues.push(`ISSUE: schlangen_abenteuer should trigger after card 2, but didn't by round ${round}`);
      }
      if (round === 6 && !storyTracker.triggered.has('kindergeburtstag')) {
        issues.push(`ISSUE: kindergeburtstag should trigger after card 5, but didn't by round ${round}`);
      }
      
      // Check for story card order issues
      const storyCards = {
        'morgen_routine': ['morgen_stress', 'hausaufgaben_drama'],
        'schlangen_abenteuer': ['schlange_wunsch', 'schlangen_begegnung'],
        'kindergeburtstag': ['geburtstag_planung', 'party_ort', 'geschenke_dilemma']
      };
      
      Object.entries(storyCards).forEach(([storyName, cards]) => {
        cards.forEach((expectedCard, index) => {
          if (cardInfo.title === expectedCard) {
            const previousCards = cards.slice(0, index);
            const appearedBefore = previousCards.filter(c => storyTracker.cardSequence.includes(c));
            
            if (appearedBefore.length !== index) {
              issues.push(`ISSUE: ${storyName} card "${expectedCard}" appeared out of order (expected after ${previousCards.join(', ')})`);
            }
          }
        });
      });
      
      console.log(`Round ${round}: "${cardInfo.title}" | Powers: G=${cardInfo.powerValues.geld}, K=${cardInfo.powerValues.kinder_glueck}, N=${cardInfo.powerValues.eltern_nerven}, H=${cardInfo.powerValues.kinder_gesundheit}`);
      
      // Make balanced choices to avoid game over
      const choice = round % 2 === 0 ? 'left' : 'right';
      await page.click(choice === 'left' ? '#left-choice' : '#right-choice');
      await page.waitForTimeout(500);
      
      // Check for game over
      const isGameOver = await page.evaluate(() => {
        return document.querySelector('.game-over') !== null;
      });
      
      if (isGameOver) {
        console.log(`\nGame ended at round ${round}`);
        break;
      }
    }
    
    console.log('\n📊 Analysis Results:');
    console.log(`Card sequence: ${storyTracker.cardSequence.join(' → ')}`);
    console.log(`Stories triggered: ${Array.from(storyTracker.triggered).join(', ')}`);
    console.log(`Stories completed: ${Array.from(storyTracker.completed).join(', ')}`);
    
    if (storyTracker.duplicateCards.length > 0) {
      console.log(`\n❌ Duplicate cards found: ${storyTracker.duplicateCards.join(', ')}`);
    }
    
    if (issues.length > 0) {
      console.log('\n❌ Issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ No major story logic issues detected!');
    }
    
    // Specific checks
    console.log('\n🔍 Specific Checks:');
    
    // Check if story cards appear in both regular deck and stories
    const regularCards = ['intro', 'krank_kind', 'putzen_chaos', 'abends_routine', 'familien_urlaub', 'schlechte_noten', 'spielzeit_streit', 'taschengeld_diskussion', 'hausarbeit_verweigerung', 'fernsehen_streit'];
    const storyOnlyCards = ['morgen_stress', 'hausaufgaben_drama', 'schlange_wunsch', 'schlangen_begegnung', 'geburtstag_planung', 'party_ort', 'geschenke_dilemma'];
    
    const regularCardsFound = storyTracker.cardSequence.filter(c => regularCards.includes(c));
    const storyCardsFound = storyTracker.cardSequence.filter(c => storyOnlyCards.includes(c));
    
    console.log(`Regular cards appeared: ${regularCardsFound.length} (${regularCardsFound.join(', ')})`);
    console.log(`Story cards appeared: ${storyCardsFound.length} (${storyCardsFound.join(', ')})`);
    
    if (storyCardsFound.length === 0) {
      console.log('❌ NO STORY CARDS APPEARED - Story injection not working!');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeStoryIssues();