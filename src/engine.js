// engine.js: Core game logic (deck, powers, boosters, choices)
export class Engine {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    // Initialize powers
    this.powers = {};
    this.config.powers.forEach(p => {
      const min = p.min, max = p.max;
      const initValue = Math.floor(max / 2);
      this.powers[p.name] = { value: initValue, min, max };
    });
    // Active boosters
    this.activeBoosters = [];
    // Deck and history
    this.deck = this.config.cards.map(c => c.id);
    if (this.config.entry_card) {
      this.deck = this.deck.filter(id => id !== this.config.entry_card);
    }
    
    // Remove story cards from main deck - they'll be injected by stories
    const storyCardIds = new Set();
    this.config.stories.forEach(story => {
      if (story.cards) {
        story.cards.forEach(card => {
          // Handle both old format (string) and new format (object with id)
          const cardId = typeof card === 'string' ? card : card.id;
          storyCardIds.add(cardId);
        });
      }
    });
    this.deck = this.deck.filter(id => !storyCardIds.has(id));
    this.shuffleDeck();
    this.history = [];
    // Story tracking: triggered and completed stories by id
    this.triggeredStories = new Set();
    this.completedStories = new Set();
    // Story acceptance/rejection tracking
    this.acceptedStories = new Set();
    this.rejectedStories = new Set();
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  draw() {
    if (this.deck.length === 0) {
      this.deck = this.config.cards.map(c => c.id);
      this.shuffleDeck();
    }
    const id = this.deck.shift();
    return this.config.cards.find(c => c.id === id);
  }

  applyBoostersOnCap(powerName) {
    const pCfg = this.config.powers.find(p => p.name === powerName);
    let cap = pCfg ? pCfg.max : Infinity;
    this.activeBoosters.forEach(b => {
      b.modifiers.forEach(mod => {
        if (mod.power_cap) {
          const { power, value } = mod.power_cap;
          if ((power === powerName || power === '*') && value > cap) {
            cap = value;
          }
        }
      });
    });
    return cap;
  }

  applyEffectModifiers(powerName, rawValue) {
    let val = rawValue;
    this.activeBoosters.forEach(b => {
      b.modifiers.forEach(mod => {
        if (mod.effect_modifier) {
          const { power, type, multiplier } = mod.effect_modifier;
          if (power === powerName || power === '*') {
            if (type === 'loss' && rawValue < 0) val = rawValue * multiplier;
            if (type === 'gain' && rawValue > 0) val = rawValue * multiplier;
          }
        }
      });
    });
    return val;
  }

  applyEffects(effects = []) {
    effects.forEach(e => {
      Object.entries(e).forEach(([powerName, delta]) => {
        const modified = this.applyEffectModifiers(powerName, delta);
        const p = this.powers[powerName];
        if (!p) return;
        p.value += modified;
        // Enforce bounds
        const cap = this.applyBoostersOnCap(powerName);
        if (p.value > cap) p.value = cap;
        if (p.value < p.min) p.value = p.min;
      });
    });
  }

  updateBoosters() {
    this.activeBoosters.forEach(b => b.remaining--);
    this.activeBoosters = this.activeBoosters.filter(b => b.remaining > 0);
  }

  choose(card, direction) {
    const choice = direction === 'left' ? card.left : card.right;
    if (choice.effects) this.applyEffects(choice.effects);
    if (choice.follow_up) this.deck.unshift(choice.follow_up);
    if (choice.booster) {
      const booster = this.config.boosters.find(b => b.id === choice.booster);
      if (booster) this.activeBoosters.push({ ...booster, remaining: booster.duration });
    }
    
    // Handle story acceptance/rejection based on player choice
    if (choice.accept_story) {
      console.log(`✅ Player accepted story: ${choice.accept_story}`);
      this.acceptedStories.add(choice.accept_story);
      
      // If story was already triggered but waiting for acceptance, mix cards now
      const story = this.config.stories.find(s => s.id === choice.accept_story);
      if (story && this.triggeredStories.has(story.id)) {
        console.log(`🎯 Mixing cards for accepted story: ${story.id}`);
        // Handle new probabilistic story format
        if (Array.isArray(story.cards) && story.cards.length && story.cards[0].probability !== undefined) {
          this.mixProbabilisticStoryCards(story);
        }
        // Handle old sequential story format (backward compatibility)
        else if (Array.isArray(story.cards) && story.cards.length) {
          const windowSize = story.insert_window;
          if (Number.isInteger(windowSize) && windowSize > 0) {
            for (let i = story.cards.length - 1; i >= 0; i--) {
              const cardId = story.cards[i];
              const maxIdx = Math.min(windowSize, this.deck.length);
              const idx = Math.floor(Math.random() * (maxIdx + 1));
              this.deck.splice(idx, 0, cardId);
            }
          } else {
            this.deck.unshift(...story.cards);
          }
        }
      }
    }
    if (choice.reject_story) {
      console.log(`❌ Player rejected story: ${choice.reject_story}`);
      this.rejectedStories.add(choice.reject_story);
    }
    
    this.updateBoosters();
    this.history.push({ card: card.id, choice: direction });
    // Handle story completion (mark stories whose last card was just played)
    this.config.stories.forEach(story => {
      if (this.triggeredStories.has(story.id) && !this.completedStories.has(story.id)) {
        const seq = story.cards || [];
        if (seq.length) {
          // Handle both old format (string) and new format (object with id)
          const lastCard = seq[seq.length - 1];
          const lastCardId = typeof lastCard === 'string' ? lastCard : lastCard.id;
          if (lastCardId === card.id) {
            this.completedStories.add(story.id);
          }
        }
      }
    });
    // Trigger new stories when their conditions are met
    this.config.stories.forEach(story => {
      if (!this.triggeredStories.has(story.id)) {
        const after = story.trigger?.after_cards;
        const req = story.trigger?.requires_story_completed || [];
        const haveReq = Array.isArray(req) && req.every(r => this.completedStories.has(r));
        if ((after == null || this.history.length >= after) && haveReq) {
          
          // Check if story has been explicitly rejected
          if (this.rejectedStories.has(story.id)) {
            console.log(`🚫 Story ${story.id} was rejected by player - skipping card mixing`);
            this.triggeredStories.add(story.id);
            return;
          }
          
          // Only mix cards if story is accepted OR has no acceptance requirement
          const storyAccepted = this.acceptedStories.has(story.id);
          const hasAcceptanceChoices = this.hasStoryAcceptanceChoices(story.id);
          
          if (!hasAcceptanceChoices || storyAccepted) {
            // Handle new probabilistic story format
            if (Array.isArray(story.cards) && story.cards.length && story.cards[0].probability !== undefined) {
              this.mixProbabilisticStoryCards(story);
            }
            // Handle old sequential story format (backward compatibility)
            else if (Array.isArray(story.cards) && story.cards.length) {
              const windowSize = story.insert_window;
              if (Number.isInteger(windowSize) && windowSize > 0) {
                for (let i = story.cards.length - 1; i >= 0; i--) {
                  const cardId = story.cards[i];
                  const maxIdx = Math.min(windowSize, this.deck.length);
                  const idx = Math.floor(Math.random() * (maxIdx + 1));
                  this.deck.splice(idx, 0, cardId);
                }
              } else {
                this.deck.unshift(...story.cards);
              }
            }
          } else {
            console.log(`⏳ Story ${story.id} waiting for player acceptance`);
          }
          
          this.triggeredStories.add(story.id);
        }
      }
    });
  }

  hasStoryAcceptanceChoices(storyId) {
    // Check if any card has accept_story or reject_story choices for this story
    return this.config.cards.some(card => {
      const leftAccepts = card.left?.accept_story === storyId;
      const leftRejects = card.left?.reject_story === storyId;
      const rightAccepts = card.right?.accept_story === storyId;
      const rightRejects = card.right?.reject_story === storyId;
      return leftAccepts || leftRejects || rightAccepts || rightRejects;
    });
  }

  mixProbabilisticStoryCards(story) {
    console.log(`🎲 Mixing probabilistic story: ${story.id}`);
    
    story.cards.forEach(storyCard => {
      const { id: cardId, probability, mix_in_next } = storyCard;
      
      // Roll for probability
      const roll = Math.random();
      console.log(`  🎯 Card ${cardId}: ${(probability * 100).toFixed(0)}% chance, rolled ${(roll * 100).toFixed(0)}%`);
      
      if (roll <= probability) {
        // Card is selected, mix it into the specified range
        const mixRange = Math.min(mix_in_next || 15, this.deck.length);
        const insertPosition = Math.floor(Math.random() * (mixRange + 1));
        
        this.deck.splice(insertPosition, 0, cardId);
        console.log(`    ✅ Added ${cardId} at position ${insertPosition} (range: ${mixRange})`);
      } else {
        console.log(`    ❌ Skipped ${cardId} (failed probability roll)`);
      }
    });
  }

  isGameOver() {
    return this.config.powers.some(p => {
      const current = this.powers[p.name]?.value;
      const cap = this.applyBoostersOnCap(p.name);
      // Game over when a power hits its min or its (possibly boosted) cap
      return current <= p.min || current >= cap;
    });
  }
}