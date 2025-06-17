# ChoiceCore Development Tools

This directory contains development and debugging tools for ChoiceCore game development.

## 🎮 Monte Carlo Simulation Suite

Tools for analyzing game balance, trajectory patterns, and player behavior through automated simulation.

### Core Scripts

- **`monte_carlo_simulation.js`** - Headless game simulation engine
- **`trajectory_visualizer.js`** - Interactive HTML visualization generator  
- **`run_extended_analysis.js`** - Long-running comprehensive analysis framework

### Quick Start

```bash
# Install dependencies (from project root)
npm install

# Run basic simulation (1000 games)
node tools/monte_carlo_simulation.js eltern_simulator 1000 results.json

# Generate interactive visualization
node tools/trajectory_visualizer.js results.json analysis.html

# Extended analysis (1 hour of continuous simulation)
node tools/run_extended_analysis.js eltern_simulator 60
```

### Use Cases

**🔧 Game Development**
- Test game balance and difficulty curves
- Identify problematic power combinations
- Validate story trigger conditions
- Analyze card play frequency

**📊 Game Analysis** 
- Understand typical player trajectories
- Identify most common game over scenarios
- Measure average game length
- Analyze power distribution patterns

**🐛 Debugging**
- Detect infinite loops or broken game states
- Validate story logic and dependencies
- Test edge cases at scale
- Performance profiling

### Output Files

- **JSON Results**: Raw simulation data with trajectory details
- **HTML Visualizations**: Interactive charts and statistics
- **Extended Analysis**: Comprehensive reports with correlations

### Performance

- ~30,000 simulations per second
- 1-hour run = ~1.8 million game trajectories
- Adaptive batch sizing for optimal performance
- Memory-efficient trajectory sampling

### Example Insights

From a 2000-game analysis of Eltern Simulator:
- 58.3% of games end with children's happiness maxing out
- 25.5% end with parent stress hitting minimum  
- Average game length: 4.5 cards
- Money problems cause 11.9% of game endings

These tools help developers understand game flow, balance mechanics, and create more engaging narrative experiences.