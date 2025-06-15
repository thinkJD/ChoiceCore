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
    // Card counter for tracking progress
    this.cardCount = 0;
    // Story tracking: triggered and completed stories by id
    this.triggeredStories = new Set();
    this.completedStories = new Set();
    // Story acceptance/rejection tracking
    this.acceptedStories = new Set();
    this.rejectedStories = new Set();
    // Track which stories have had their cards mixed to prevent duplicates
    this.storyCardsMixed = new Set();
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
    this.cardCount++; // Increment card counter on each draw
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
      if (story && this.triggeredStories.has(story.id) && !this.storyCardsMixed.has(story.id)) {
        console.log(`🎯 Mixing cards for accepted story: ${story.id}`);
        this.storyCardsMixed.add(story.id);
        // Add embedded cards to config when accepting
        this.addEmbeddedCardsToConfig(story);
        // Handle new probabilistic story format
        const cardsToCheck = story.story_cards || story.cards || [];
        if (Array.isArray(cardsToCheck) && cardsToCheck.length && cardsToCheck[0].probability !== undefined) {
          this.mixProbabilisticStoryCards(story);
        }
        // Handle old sequential story format (backward compatibility)
        else {
          const cardsToMix = story.story_cards || story.cards || [];
          if (Array.isArray(cardsToMix) && cardsToMix.length) {
          const windowSize = story.insert_window;
          if (Number.isInteger(windowSize) && windowSize > 0) {
            for (let i = cardsToMix.length - 1; i >= 0; i--) {
              const storyCard = cardsToMix[i];
              const cardId = typeof storyCard === 'string' ? storyCard : storyCard.id;
              
              // Card object already added to config by addEmbeddedCardsToConfig
              
              const maxIdx = Math.min(windowSize, this.deck.length);
              const idx = Math.floor(Math.random() * (maxIdx + 1));
              this.deck.splice(idx, 0, cardId);
            }
          } else {
            // Add all story cards to the front of the deck
            for (let i = cardsToMix.length - 1; i >= 0; i--) {
              const storyCard = cardsToMix[i];
              const cardId = typeof storyCard === 'string' ? storyCard : storyCard.id;
              
              // Card object already added to config by addEmbeddedCardsToConfig
              
              this.deck.unshift(cardId);
            }
          }
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
        const seq = story.story_cards || story.cards || [];
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
            this.storyCardsMixed.add(story.id);
            // Add embedded cards to config when actually mixing
            this.addEmbeddedCardsToConfig(story);
            // Handle new probabilistic story format
            const cardsToCheck = story.story_cards || story.cards || [];
            if (Array.isArray(cardsToCheck) && cardsToCheck.length && cardsToCheck[0].probability !== undefined) {
              this.mixProbabilisticStoryCards(story);
            }
            // Handle old sequential story format (backward compatibility)
            else {
              const cardsToMix = story.story_cards || story.cards || [];
              if (Array.isArray(cardsToMix) && cardsToMix.length) {
                const windowSize = story.insert_window;
                if (Number.isInteger(windowSize) && windowSize > 0) {
                  // Insert cards in reverse order so first card has better chance to appear first
                  for (let i = cardsToMix.length - 1; i >= 0; i--) {
                    const storyCard = cardsToMix[i];
                  const cardId = typeof storyCard === 'string' ? storyCard : storyCard.id;
                  
                  // Add embedded card to available cards
                  if (typeof storyCard === 'object' && storyCard.id) {
                    this.config.cards.push(storyCard);
                  }
                  
                  const maxIdx = Math.min(windowSize, this.deck.length);
                  const idx = Math.floor(Math.random() * (maxIdx + 1));
                  this.deck.splice(idx, 0, cardId);
                }
              } else {
                // Add all story cards to the front of the deck in reverse order
                // (so first card in array appears first when drawn)
                for (let i = cardsToMix.length - 1; i >= 0; i--) {
                  const storyCard = cardsToMix[i];
                  const cardId = typeof storyCard === 'string' ? storyCard : storyCard.id;
                  
                  // Add embedded card to available cards
                  if (typeof storyCard === 'object' && storyCard.id) {
                    this.config.cards.push(storyCard);
                  }
                  
                  this.deck.unshift(cardId);
                }
              }
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

  addEmbeddedCardsToConfig(story) {
    // Add story_cards to config when story is triggered
    const cardsToAdd = story.story_cards || story.cards || [];
    
    cardsToAdd.forEach(storyCard => {
      // Only add full card objects (not string references)
      if (typeof storyCard === 'object' && storyCard.id) {
        // Check if card is already in config
        const exists = this.config.cards.some(c => c.id === storyCard.id);
        if (!exists) {
          this.config.cards.push(storyCard);
          console.log(`📝 Added embedded story card to config: ${storyCard.id}`);
        }
      }
    });
  }

  hasStoryAcceptanceChoices(storyId) {
    // Check if the story has any trigger cards with accept_story or reject_story choices
    const story = this.config.stories.find(s => s.id === storyId);
    if (!story) return false;
    
    // Check trigger_cards for acceptance choices
    if (story.trigger_cards) {
      const hasAcceptance = story.trigger_cards.some(card => {
        const leftAccepts = card.left?.accept_story === storyId;
        const leftRejects = card.left?.reject_story === storyId;
        const rightAccepts = card.right?.accept_story === storyId;
        const rightRejects = card.right?.reject_story === storyId;
        return leftAccepts || leftRejects || rightAccepts || rightRejects;
      });
      if (hasAcceptance) return true;
    }
    
    // Check old format cards for backward compatibility
    if (story.cards) {
      return story.cards.some(card => {
        // Handle both old format (string) and new format (full card object)
        if (typeof card === 'string') return false;
        
        const leftAccepts = card.left?.accept_story === storyId;
        const leftRejects = card.left?.reject_story === storyId;
        const rightAccepts = card.right?.accept_story === storyId;
        const rightRejects = card.right?.reject_story === storyId;
        return leftAccepts || leftRejects || rightAccepts || rightRejects;
      });
    }
    
    return false;
  }

  mixProbabilisticStoryCards(story) {
    console.log(`🎲 Mixing probabilistic story: ${story.id}`);
    
    // Use story_cards for new format, fallback to cards for old format
    const cardsToMix = story.story_cards || story.cards || [];
    
    cardsToMix.forEach(storyCard => {
      // Handle both old format (string) and new format (full card object)
      let cardId, probability, mix_in_next;
      
      if (typeof storyCard === 'string') {
        // Old format: just card ID
        cardId = storyCard;
        probability = 1.0; // Default 100% chance
        mix_in_next = 15; // Default range
      } else if (storyCard.probability !== undefined) {
        // New probabilistic format with embedded card
        cardId = storyCard.id;
        probability = storyCard.probability;
        mix_in_next = storyCard.mix_in_next;
      } else {
        // New embedded format without probability (sequential)
        cardId = storyCard.id;
        probability = 1.0; // Default 100% chance for sequential cards
        mix_in_next = 15; // Default range
      }
      
      // Roll for probability
      const roll = Math.random();
      console.log(`  🎯 Card ${cardId}: ${(probability * 100).toFixed(0)}% chance, rolled ${(roll * 100).toFixed(0)}%`);
      
      if (roll <= probability) {
        // Card is selected, mix it into the specified range
        const mixRange = Math.min(mix_in_next || 15, this.deck.length);
        const insertPosition = Math.floor(Math.random() * (mixRange + 1));
        
        // Add card ID to deck (card object already added to config by addEmbeddedCardsToConfig)
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

  getGameOverInfo() {
    for (const p of this.config.powers) {
      const current = this.powers[p.name]?.value;
      const cap = this.applyBoostersOnCap(p.name);
      
      if (current <= p.min) {
        return {
          power: p.name,
          value: current,
          boundary: 'min',
          scenario: this.getGameOverScenario(p.name, 'min'),
          cardCount: this.cardCount
        };
      }
      if (current >= cap) {
        return {
          power: p.name,
          value: current,
          boundary: 'max',
          scenario: this.getGameOverScenario(p.name, 'max'),
          cardCount: this.cardCount
        };
      }
    }
    return null;
  }

  getGameOverScenario(powerName, boundary) {
    const scenarios = {
      geld: {
        min: [
          "Der Familienkontostand ist leer. Die Bankkarte wurde vom Automaten eingezogen.",
          "Ihr Kind fragt nach einem Eis. Du musst ihm erklären, was 'dispo' bedeutet.",
          "Es kommt ein Brief vom Amt – Nachzahlung. Du hast keine Chance, ihn zu bezahlen.",
          "Du hast das letzte Kleingeld in die Kita-Spardose geworfen. Für euch bleibt nur Leitungswasser."
        ],
        max: [
          "Du hast so viel gespart, dass dir ein Sparkassenberater einen ETF erklärt.",
          "Mit dem ganzen Geld könntest du endlich durchatmen – aber irgendwas fühlt sich komisch an…",
          "Das Konto ist voll, aber dein Kind fragt: 'Warum hast du eigentlich nie Zeit?'",
          "Ihr lebt minimalistisch – und sitzt auf einem Haufen Geld. Und jetzt?"
        ]
      },
      kinder_glueck: {
        min: [
          "Dein Kind sitzt im Zimmer und sagt nichts mehr. Nicht mal beim Pudding.",
          "Ein trotziges 'Mir doch egal' begleitet euch durch den Alltag.",
          "Das letzte 'Ich hab dich lieb' ist Wochen her.",
          "Stille. Kein Streit, kein Lachen. Nur Leere."
        ],
        max: [
          "Dein Kind tanzt auf dem Tisch, ruft 'Alles ist meins!' und verteilt Sticker im Haus.",
          "Du hast dein ganzes Leben dem Glück deines Kindes untergeordnet. Es feiert – du fällst um.",
          "Ein Tag ohne 'Ja' wäre für dein Kind jetzt ein Grund zur Revolte.",
          "Dein Kind ist überglücklich – aber du fragst dich, wann du das letzte Mal geschlafen hast."
        ]
      },
      eltern_nerven: {
        min: [
          "Du hast versehentlich mit der Kaffeemaschine telefoniert.",
          "Du sitzt im Auto und fragst dich: Wohin wollte ich fahren?",
          "Die Kinder streiten. Du sitzt da und starrst nur noch auf die Wand.",
          "Ein Blick. Eine Socke auf dem Boden. Du zerbrichst innerlich."
        ],
        max: [
          "Du bist komplett entspannt. Vielleicht zu entspannt. Die Kinder reiten auf dem Hund.",
          "Alles läuft glatt. Zu glatt. Du beginnst aus Langeweile zu kontrollieren.",
          "Du hast so viel Energie, dass du drei Bastelprojekte gleichzeitig beginnst.",
          "Du bist so ausgeruht, dass du der WhatsApp-Gruppe freiwillig geantwortet hast."
        ]
      },
      kinder_gesundheit: {
        min: [
          "Das Kind liegt krank im Bett. Du fühlst dich machtlos.",
          "Dauernd krank, immer wieder. Selbst das Kinderarzt-Wartezimmer kennt euch beim Namen.",
          "Der Kinderarzt sagt: 'Das müssen wir jetzt wirklich ernst nehmen.'",
          "Dein Kind fragt: 'Warum bin ich immer müde?' – und du hast keine Antwort."
        ],
        max: [
          "Dein Kind rennt, klettert, turnt – nonstop. Du kommst kaum hinterher.",
          "Beim Sportfest hat dein Kind alle abgezogen – und verlangt jetzt ein Trainingslager.",
          "Dein Kind predigt über gesunde Ernährung. Du versteckst den Schokoriegel.",
          "Topfit, kerngesund – aber wehe, du servierst kein Bio."
        ]
      }
    };

    const powerScenarios = scenarios[powerName];
    if (!powerScenarios || !powerScenarios[boundary]) {
      return "Das Elternleben hat Sie an Ihre Grenzen gebracht...";
    }

    const scenarioList = powerScenarios[boundary];
    const randomIndex = Math.floor(Math.random() * scenarioList.length);
    return scenarioList[randomIndex];
  }
}