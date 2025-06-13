// Detailed test without browser - test game logic and file structure
const fs = require('fs');

console.log('🎮 Testing Eltern Simulator Game Logic...\n');

// Test 1: Validate YAML files can be parsed
function testYAMLStructure() {
  console.log('📋 Testing YAML file structure...');
  
  try {
    // Test game.yaml
    const gameYaml = fs.readFileSync('games/eltern_simulator/game.yaml', 'utf8');
    console.log('✅ game.yaml exists and readable');
    
    // Check if all referenced card files exist
    const cardReferences = gameYaml.match(/- "cards\/[^"]+"/g) || [];
    console.log(`📄 Found ${cardReferences.length} card references`);
    
    cardReferences.forEach(ref => {
      const fileName = ref.replace(/- "/, '').replace(/"/, '');
      const filePath = `games/eltern_simulator/${fileName}`;
      
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${fileName}`);
        
        // Check YAML structure
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('id:') && content.includes('description:') && 
            content.includes('left:') && content.includes('right:')) {
          console.log(`    ✅ Valid structure`);
        } else {
          console.log(`    ❌ Invalid structure`);
        }
      } else {
        console.log(`  ❌ ${fileName} - FILE MISSING`);
      }
    });
    
    // Test story files
    const storyReferences = gameYaml.match(/- "stories\/[^"]+"/g) || [];
    console.log(`📚 Found ${storyReferences.length} story references`);
    
    storyReferences.forEach(ref => {
      const fileName = ref.replace(/- "/, '').replace(/"/, '');
      const filePath = `games/eltern_simulator/${fileName}`;
      
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${fileName}`);
      } else {
        console.log(`  ❌ ${fileName} - FILE MISSING`);
      }
    });
    
  } catch (error) {
    console.error('❌ YAML structure test failed:', error.message);
  }
}

// Test 2: Check for common YAML errors
function testYAMLSyntax() {
  console.log('\n🔍 Testing for common YAML syntax errors...');
  
  const cardFiles = fs.readdirSync('games/eltern_simulator/cards/').filter(f => f.endsWith('.yaml'));
  
  cardFiles.forEach(file => {
    const content = fs.readFileSync(`games/eltern_simulator/cards/${file}`, 'utf8');
    const lines = content.split('\n');
    
    console.log(`\n📄 Checking ${file}:`);
    
    // Check for missing fields
    const requiredFields = ['id:', 'image:', 'description:', 'left:', 'right:'];
    requiredFields.forEach(field => {
      if (content.includes(field)) {
        console.log(`  ✅ Has ${field}`);
      } else {
        console.log(`  ❌ Missing ${field}`);
      }
    });
    
    // Check for malformed YAML
    if (content.includes('image: placeholder.svgdescription:')) {
      console.log(`  ❌ Malformed YAML: image and description merged`);
    }
    
    // Check for proper indentation
    const effectLines = lines.filter(line => line.includes('effects:'));
    if (effectLines.length > 0) {
      console.log(`  ✅ Has effects section`);
    }
  });
}

// Test 3: Simulate game engine logic
function testGameLogic() {
  console.log('\n⚙️ Testing game engine logic simulation...');
  
  // Simulate the story triggering logic
  const stories = [
    { id: 'morgen_routine', after_cards: 1 },
    { id: 'schlangen_abenteuer', after_cards: 2 },
    { id: 'kindergeburtstag', after_cards: 5 },
  ];
  
  let cardsPlayed = 0;
  const triggeredStories = new Set();
  
  console.log('🎯 Simulating story triggers:');
  
  for (let i = 0; i < 10; i++) {
    cardsPlayed++;
    console.log(`\nCard ${cardsPlayed} played:`);
    
    stories.forEach(story => {
      if (!triggeredStories.has(story.id) && cardsPlayed >= story.after_cards) {
        triggeredStories.add(story.id);
        console.log(`  🎬 Story triggered: ${story.id}`);
      }
    });
    
    console.log(`  📊 Stories triggered so far: ${Array.from(triggeredStories).join(', ')}`);
  }
}

// Run all tests
testYAMLStructure();
testYAMLSyntax();
testGameLogic();

console.log('\n🏁 Testing complete!');