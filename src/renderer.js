// renderer.js: Update DOM to show cards and power values
export function renderCard(card, config) {
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  // Title
  const titleEl = document.createElement('div');
  titleEl.textContent = card.id;
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
  
  // Add hover preview functionality
  setupHoverPreview(leftBtn, card.left?.effects || []);
  setupHoverPreview(rightBtn, card.right?.effects || []);
}

export function renderPowers(powers) {
  const ICONS = {
    parent_money: '💰',
    kids_happiness: '😊',
    parent_mental_health: '🧠',
    kids_health: '❤️',
    geld: '💰',
    kinder_glueck: '😊',
    eltern_nerven: '🧠',
    kinder_gesundheit: '❤️',
  };
  
  const NAMES = {
    geld: 'Geld',
    kinder_glueck: 'Glück',
    eltern_nerven: 'Nerven',
    kinder_gesundheit: 'Gesundheit',
  };
  
  const container = document.getElementById('powers');
  container.innerHTML = '';
  Object.entries(powers).forEach(([name, p]) => {
    const icon = ICONS[name] || '';
    const displayName = NAMES[name] || name;
    const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
    const pctClamped = Math.max(0, Math.min(100, pct));
    
    const wrapper = document.createElement('div');
    wrapper.className = 'power-container';

    const iconEl = document.createElement('span');
    iconEl.className = 'power-icon';
    iconEl.textContent = icon;
    wrapper.appendChild(iconEl);
    
    const nameEl = document.createElement('span');
    nameEl.className = 'power-name';
    nameEl.textContent = displayName;
    wrapper.appendChild(nameEl);

    const barBg = document.createElement('div');
    barBg.className = 'power-bar-bg';
    const barFill = document.createElement('div');
    barFill.className = 'power-bar-fill';
    barFill.id = `bar-${name}`;
    barFill.style.height = pctClamped + '%';
    barBg.appendChild(barFill);
    wrapper.appendChild(barBg);
    
    const valueEl = document.createElement('span');
    valueEl.className = 'power-value';
    valueEl.textContent = p.value;
    wrapper.appendChild(valueEl);
    
    const previewEl = document.createElement('div');
    previewEl.className = 'power-preview';
    previewEl.id = `preview-${name}`;
    wrapper.appendChild(previewEl);

    container.appendChild(wrapper);
  });
}

/**
 * Show a game-over 'lose' card when a power hits its bounds.
 */
function setupHoverPreview(button, effects) {
  // Remove existing event listeners
  button.removeEventListener('mouseenter', button._previewEnter);
  button.removeEventListener('mouseleave', button._previewLeave);
  
  const previewEnter = () => showPreview(effects);
  const previewLeave = () => hidePreview();
  
  button._previewEnter = previewEnter;
  button._previewLeave = previewLeave;
  
  button.addEventListener('mouseenter', previewEnter);
  button.addEventListener('mouseleave', previewLeave);
}

function showPreview(effects) {
  effects.forEach(effect => {
    Object.entries(effect).forEach(([powerName, change]) => {
      const previewEl = document.getElementById(`preview-${powerName}`);
      const barFill = document.getElementById(`bar-${powerName}`);
      
      if (previewEl && barFill) {
        // Parse the change value, handling +/- prefixes
        const changeStr = String(change);
        const changeValue = parseInt(changeStr.replace(/^\+/, ''));
        const isPositive = changeValue > 0;
        
        // Display the change with proper sign
        previewEl.textContent = `${changeValue > 0 ? '+' : ''}${changeValue}`;
        previewEl.className = `power-preview visible ${isPositive ? 'positive' : 'negative'}`;
        
        barFill.classList.add(isPositive ? 'preview-positive' : 'preview-negative');
      }
    });
  });
}

function hidePreview() {
  document.querySelectorAll('.power-preview').forEach(el => {
    el.classList.remove('visible');
  });
  
  document.querySelectorAll('.power-bar-fill').forEach(el => {
    el.classList.remove('preview-positive', 'preview-negative');
  });
}

export function renderGameOver() {
  // Hide choices
  const choices = document.querySelector('.choices');
  if (choices) choices.style.display = 'none';
  
  // Add game-over styling to card container
  const container = document.getElementById('card-container');
  container.classList.add('game-over');
  container.innerHTML = '';
  
  const titleEl = document.createElement('div');
  titleEl.textContent = 'Spiel Beendet';
  titleEl.className = 'card-title';
  container.appendChild(titleEl);
  
  const descEl = document.createElement('p');
  descEl.textContent = 'Ein Wert hat die kritische Grenze erreicht. Ihre Elternreise ist zu Ende! Laden Sie die Seite neu, um erneut zu spielen.';
  descEl.className = 'card-description';
  container.appendChild(descEl);
}