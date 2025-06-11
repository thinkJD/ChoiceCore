// renderer.js: Update DOM to show cards and power values
export function renderCard(card, config) {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  // Title
  const titleEl = document.createElement('div');
  titleEl.textContent = card.title || card.id;
  titleEl.className = 'card-title';
  container.appendChild(titleEl);
  // Image
  if (card.image) {
    const img = document.createElement('img');
    img.src = config.basePath + (config.assets?.base_path || '') + card.image;
    img.alt = '';
    img.className = 'card-image';
    container.appendChild(img);
  }
  // Description
  const desc = document.createElement('p');
  desc.textContent = card.description || '';
  desc.className = 'card-description';
  container.appendChild(desc);
  // Update choice buttons
  const leftBtn = document.getElementById('left-choice');
  leftBtn.textContent = card.left?.label || '';
  const rightBtn = document.getElementById('right-choice');
  rightBtn.textContent = card.right?.label || '';
}

export function renderPowers(powers) {
  const ICONS = {
    parent_money: '💰',
    kids_happiness: '😊',
    parent_mental_health: '🧠',
    kids_health: '❤️',
  };
  const container = document.getElementById('powers');
  container.innerHTML = '';
  Object.entries(powers).forEach(([name, p]) => {
    const icon = ICONS[name] || '';
    const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
    const pctClamped = Math.max(0, Math.min(100, pct));
    const wrapper = document.createElement('div');
    wrapper.className = 'power-container';

    const iconEl = document.createElement('span');
    iconEl.className = 'power-icon';
    iconEl.textContent = icon;
    wrapper.appendChild(iconEl);

    const barBg = document.createElement('div');
    barBg.className = 'power-bar-bg';
    const barFill = document.createElement('div');
    barFill.className = 'power-bar-fill';
    barFill.style.width = pctClamped + '%';
    barBg.appendChild(barFill);
    wrapper.appendChild(barBg);

    container.appendChild(wrapper);
  });
}

/**
 * Show a game-over 'lose' card when a power hits its bounds.
 */
export function renderGameOver() {
  // Hide choices and powers display
  const choices = document.querySelector('.choices');
  if (choices) choices.style.display = 'none';
  const powers = document.getElementById('powers');
  if (powers) powers.style.display = 'none';
  // Render lose card
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  const titleEl = document.createElement('div');
  titleEl.textContent = 'Verloren';
  titleEl.className = 'card-title';
  container.appendChild(titleEl);
  const descEl = document.createElement('p');
  descEl.textContent = 'Ein Wert hat die Grenze erreicht. Du hast verloren!';
  descEl.className = 'card-description';
  container.appendChild(descEl);
}