#!/usr/bin/env node

// Monte Carlo simulation for ChoiceCore game engine
// Runs headless simulations without browser dependencies

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Headless game loader
class HeadlessLoader {
  static async loadGameConfig(gameName) {
    const basePath = path.join(__dirname, '..', 'games', gameName);
    const gameYamlPath = path.join(basePath, 'game.yaml');
    
    if (!fs.existsSync(gameYamlPath)) {
      throw new Error(`Game config not found: ${gameYamlPath}`);
    }
    
    const gameYamlText = fs.readFileSync(gameYamlPath, 'utf8');
    const config = yaml.load(gameYamlText);
    config.basePath = basePath;

    // Normalize powers with per-power min/max (defaults to 0/100)
    config.powers = config.powers.map(p => {
      if (typeof p === 'string') return { name: p, min: 0, max: 100 };
      return { name: p.name, min: p.min ?? 0, max: p.max ?? 100 };
    });

    // Helper to load YAML files
    const loadYaml = (relPath) => {
      const fullPath = path.join(basePath, relPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      const yamlText = fs.readFileSync(fullPath, 'utf8');
      return yaml.load(yamlText);
    };

    // Load manifests
    config.cards = (config.load?.cards || []).map(loadYaml);
    config.boosters = (config.load?.boosters || []).map(loadYaml);
    config.stories = (config.load?.stories || []).map(loadYaml);

    // Extract trigger_cards from stories and add them to main cards collection
    config.stories.forEach(story => {
      if (story.trigger_cards) {
        story.trigger_cards.forEach(triggerCard => {
          config.cards.push(triggerCard);
        });
      }
    });

    return config;
  }
}

// Headless game engine (simplified version of engine.js)
class HeadlessEngine {
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
    
    // Remove story cards from main deck
    const storyCardIds = new Set();
    this.config.stories.forEach(story => {
      if (story.cards) {
        story.cards.forEach(card => {
          const cardId = typeof card === 'string' ? card : card.id;
          storyCardIds.add(cardId);
        });
      }
    });
    this.deck = this.deck.filter(id => !storyCardIds.has(id));
    
    this.shuffleDeck();
    this.history = [];
    this.cardCount = 0;
    this.triggeredStories = new Set();
    this.completedStories = new Set();
    this.acceptedStories = new Set();
    this.rejectedStories = new Set();
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
    this.cardCount++;
    return this.config.cards.find(c => c.id === id);
  }

  applyEffects(effects = []) {
    effects.forEach(e => {
      Object.entries(e).forEach(([powerName, delta]) => {
        const p = this.powers[powerName];
        if (!p) return;
        p.value += delta;
        // Enforce bounds
        if (p.value > p.max) p.value = p.max;
        if (p.value < p.min) p.value = p.min;
      });
    });
  }

  choose(card, direction) {
    const choice = direction === 'left' ? card.left : card.right;
    if (choice.effects) this.applyEffects(choice.effects);
    if (choice.follow_up) this.deck.unshift(choice.follow_up);
    
    // Simplified story handling
    if (choice.accept_story) {
      this.acceptedStories.add(choice.accept_story);
    }
    if (choice.reject_story) {
      this.rejectedStories.add(choice.reject_story);
    }
    
    this.history.push({ card: card.id, choice: direction });
    
    // Mark story completion
    this.config.stories.forEach(story => {
      if (this.triggeredStories.has(story.id) && !this.completedStories.has(story.id)) {
        const seq = story.story_cards || story.cards || [];
        if (seq.length) {
          const lastCard = seq[seq.length - 1];
          const lastCardId = typeof lastCard === 'string' ? lastCard : lastCard.id;
          if (lastCardId === card.id) {
            this.completedStories.add(story.id);
          }
        }
      }
    });
    
    // Trigger new stories (simplified)
    this.config.stories.forEach(story => {
      if (!this.triggeredStories.has(story.id)) {
        const after = story.trigger?.after_cards;
        const req = story.trigger?.requires_story_completed || [];
        const haveReq = Array.isArray(req) && req.every(r => this.completedStories.has(r));
        if ((after == null || this.history.length >= after) && haveReq) {
          this.triggeredStories.add(story.id);
        }
      }
    });
  }

  isGameOver() {
    return this.config.powers.some(p => {
      const current = this.powers[p.name]?.value;
      return current <= p.min || current >= p.max;
    });
  }

  getGameOverInfo() {
    for (const p of this.config.powers) {
      const current = this.powers[p.name]?.value;
      
      if (current <= p.min) {
        return {
          power: p.name,
          value: current,
          boundary: 'min',
          cardCount: this.cardCount
        };
      }
      if (current >= p.max) {
        return {
          power: p.name,
          value: current,
          boundary: 'max',
          cardCount: this.cardCount
        };
      }
    }
    return null;
  }
}

// Game simulation runner
class GameSimulator {
  constructor(config) {
    this.config = config;
  }

  runSingleGame() {
    const engine = new HeadlessEngine(this.config);
    let card = this.config.cards.find(c => c.id === this.config.entry_card);
    
    if (!card) {
      throw new Error(`Entry card '${this.config.entry_card}' not found.`);
    }

    const trajectory = {
      initialPowers: JSON.parse(JSON.stringify(engine.powers)),
      moves: [],
      finalPowers: null,
      gameOverInfo: null,
      cardsPlayed: 0
    };

    while (!engine.isGameOver() && trajectory.moves.length < 1000) { // Safety limit
      // Random choice for Monte Carlo simulation
      const direction = Math.random() < 0.5 ? 'left' : 'right';
      
      // Record the move
      trajectory.moves.push({
        cardId: card.id,
        choice: direction,
        powersBefore: JSON.parse(JSON.stringify(engine.powers))
      });
      
      engine.choose(card, direction);
      
      if (engine.isGameOver()) {
        trajectory.gameOverInfo = engine.getGameOverInfo();
        break;
      }
      
      card = engine.draw();
    }

    trajectory.finalPowers = JSON.parse(JSON.stringify(engine.powers));
    trajectory.cardsPlayed = engine.cardCount;

    return trajectory;
  }

  runMonteCarloSimulation(numSimulations, progressCallback) {
    const results = {
      simulations: [],
      statistics: {
        totalGames: numSimulations,
        averageGameLength: 0,
        gameOverReasons: {},
        powerDistributions: {},
        trajectoryPatterns: []
      }
    };

    for (let i = 0; i < numSimulations; i++) {
      if (progressCallback && i % 100 === 0) {
        progressCallback(i, numSimulations);
      }
      
      const trajectory = this.runSingleGame();
      results.simulations.push(trajectory);
      
      // Update statistics
      const gameOverInfo = trajectory.gameOverInfo;
      if (gameOverInfo) {
        const reason = `${gameOverInfo.power}_${gameOverInfo.boundary}`;
        results.statistics.gameOverReasons[reason] = (results.statistics.gameOverReasons[reason] || 0) + 1;
      }
    }

    // Calculate statistics
    results.statistics.averageGameLength = results.simulations.reduce((sum, sim) => sum + sim.cardsPlayed, 0) / numSimulations;
    
    // Power distributions at game end
    this.config.powers.forEach(power => {
      const values = results.simulations.map(sim => sim.finalPowers[power.name].value);
      results.statistics.powerDistributions[power.name] = {
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      };
    });

    return results;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const gameName = args[0] || 'eltern_simulator';
  const numSimulations = parseInt(args[1]) || 1000;
  const outputFile = args[2] || 'monte_carlo_results.json';
  
  console.log(`🎮 Starting Monte Carlo simulation for game: ${gameName}`);
  console.log(`📊 Running ${numSimulations} simulations...`);
  
  try {
    const config = await HeadlessLoader.loadGameConfig(gameName);
    const simulator = new GameSimulator(config);
    
    const progressCallback = (current, total) => {
      const percent = ((current / total) * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${current}/${total} (${percent}%)`);
    };
    
    const startTime = Date.now();
    const results = simulator.runMonteCarloSimulation(numSimulations, progressCallback);
    const endTime = Date.now();
    
    console.log(`\n✅ Simulation completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    
    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`📄 Results saved to: ${outputFile}`);
    
    // Print summary statistics
    console.log('\n📈 SIMULATION SUMMARY:');
    console.log(`Average game length: ${results.statistics.averageGameLength.toFixed(1)} cards`);
    console.log('\n💀 Game Over Reasons:');
    Object.entries(results.statistics.gameOverReasons).forEach(([reason, count]) => {
      const percentage = ((count / numSimulations) * 100).toFixed(1);
      console.log(`  ${reason}: ${count} games (${percentage}%)`);
    });
    
    console.log('\n⚡ Final Power Distributions:');
    Object.entries(results.statistics.powerDistributions).forEach(([power, stats]) => {
      console.log(`  ${power}: avg=${stats.average.toFixed(1)}, min=${stats.min}, max=${stats.max}, median=${stats.median}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { HeadlessLoader, HeadlessEngine, GameSimulator };