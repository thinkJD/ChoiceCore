// loader.js: Load game configuration and YAML manifests
export async function loadGameConfig(gameName) {
  const basePath = `games/${gameName}/`;
  const resp = await fetch(`${basePath}game.yaml`);
  if (!resp.ok) throw new Error(`Failed to load game.yaml for "${gameName}" (${resp.status})`);
  const text = await resp.text();
  const config = jsyaml.load(text);
  config.basePath = basePath;

  // Normalize powers with per-power min/max (defaults to 0/100)
  config.powers = config.powers.map(p => {
    if (typeof p === 'string') return { name: p, min: 0, max: 100 };
    return { name: p.name, min: p.min ?? 0, max: p.max ?? 100 };
  });

  // Helper to fetch and parse a YAML file relative to game base path
  async function loadYaml(relPath) {
    const r = await fetch(basePath + relPath);
    if (!r.ok) throw new Error(`Failed to load ${relPath} (${r.status})`);
    const d = await r.text();
    return jsyaml.load(d);
  }

  // Load manifests (explicit file lists)
  config.cards = await Promise.all((config.load.cards || []).map(loadYaml));
  config.boosters = await Promise.all((config.load.boosters || []).map(loadYaml));
  config.stories = await Promise.all((config.load.stories || []).map(loadYaml));

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