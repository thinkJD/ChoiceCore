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
    this.shuffleDeck();
    this.history = [];
    // Story tracking: triggered and completed stories by id
    this.triggeredStories = new Set();
    this.completedStories = new Set();
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
    this.updateBoosters();
    this.history.push({ card: card.id, choice: direction });
    // Handle story completion (mark stories whose last card was just played)
    this.config.stories.forEach(story => {
      if (this.triggeredStories.has(story.id) && !this.completedStories.has(story.id)) {
        const seq = story.cards || [];
        if (seq.length && seq[seq.length - 1] === card.id) {
          this.completedStories.add(story.id);
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
          if (Array.isArray(story.cards) && story.cards.length) {
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
          this.triggeredStories.add(story.id);
        }
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