// main.js: Entry point, initializes loader, engine, and UI handlers
import { loadGameConfig } from './loader.js';
import { Engine } from './engine.js';
import { renderCard, renderPowers, renderGameOver } from './renderer.js';

async function main() {
  const params = new URLSearchParams(window.location.search);
  const game = params.get('game');
  if (!game) {
    document.body.textContent = 'No game specified. Use ?game=game_name';
    return;
  }
  let config;
  try {
    config = await loadGameConfig(game);
  } catch (e) {
    console.error(e);
    document.body.textContent = `Error loading game: ${e.message}`;
    return;
  }
  const engine = new Engine(config);
  let card = config.cards.find(c => c.id === config.entry_card);
  if (!card) {
    document.body.textContent = `Entry card '${config.entry_card}' not found.`;
    return;
  }
  renderPowers(engine.powers);
  renderCard(card, config);

  document.getElementById('left-choice').onclick = () => step('left');
  document.getElementById('right-choice').onclick = () => step('right');

  function step(direction) {
    engine.choose(card, direction);
    console.log(`Cards played: ${engine.history.length}`);
    console.log(`Triggered stories: ${Array.from(engine.triggeredStories)}`);
    console.log(`Completed stories: ${Array.from(engine.completedStories)}`);
    if (engine.isGameOver()) {
      renderGameOver();
      return;
    }
    card = engine.draw();
    renderPowers(engine.powers);
    renderCard(card, config);
  }
}

main();