// Simple test script to check game functionality
const testGameURL = 'http://localhost:3000/?game=eltern_simulator';

console.log('Testing Eltern Simulator...');

// Test 1: Check if page loads
fetch('http://localhost:3000/')
  .then(response => {
    console.log('✓ Server responds:', response.status);
    return fetch('http://localhost:3000/games/eltern_simulator/game.yaml');
  })
  .then(response => response.text())
  .then(yamlText => {
    console.log('✓ Game YAML loads');
    console.log('First few lines:', yamlText.split('\n').slice(0, 5));
    
    // Test card files
    return fetch('http://localhost:3000/games/eltern_simulator/cards/intro.yaml');
  })
  .then(response => response.text())
  .then(cardText => {
    console.log('✓ Intro card loads');
    console.log('Card content preview:', cardText.split('\n').slice(0, 3));
    
    // Check if JS modules can be loaded
    return fetch('http://localhost:3000/src/main.js');
  })
  .then(response => response.text())
  .then(jsText => {
    console.log('✓ Main JS loads');
    console.log('JS size:', jsText.length, 'characters');
  })
  .catch(error => {
    console.error('✗ Test failed:', error);
  });