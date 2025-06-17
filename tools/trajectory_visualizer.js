#!/usr/bin/env node

// Trajectory visualizer for Monte Carlo simulation results
// Creates HTML visualizations of game trajectories and statistics

import fs from 'fs';
import path from 'path';

function generateTrajectoryVisualization(results, outputFile = 'trajectory_visualization.html') {
  const { simulations, statistics } = results;
  
  // Sample a subset of trajectories for visualization (max 100 for performance)
  const maxTrajectories = Math.min(100, simulations.length);
  const sampledTrajectories = simulations.slice(0, maxTrajectories);
  
  // Prepare data for visualization
  const powerNames = Object.keys(statistics.powerDistributions);
  const trajectoryData = sampledTrajectories.map((sim, index) => ({
    id: index,
    moves: sim.moves,
    finalPowers: sim.finalPowers,
    cardsPlayed: sim.cardsPlayed,
    gameOverReason: sim.gameOverInfo ? `${sim.gameOverInfo.power}_${sim.gameOverInfo.boundary}` : 'unknown'
  }));
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChoiceCore Monte Carlo Trajectory Analysis</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .subtitle {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 40px;
            font-size: 1.2em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            border-left: 5px solid #3498db;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.1em;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .chart-container {
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .chart-title {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .trajectory-controls {
            text-align: center;
            margin: 20px 0;
        }
        .trajectory-controls button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            transition: background 0.3s;
        }
        .trajectory-controls button:hover {
            background: #2980b9;
        }
        .trajectory-controls button.active {
            background: #e74c3c;
        }
        .power-legend {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 ChoiceCore Monte Carlo Analysis</h1>
        <div class="subtitle">Trajectory analysis from ${results.statistics.totalGames} game simulations</div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Average Game Length</h3>
                <div class="stat-value">${statistics.averageGameLength.toFixed(1)}</div>
                <div class="stat-label">cards played</div>
            </div>
            <div class="stat-card">
                <h3>Total Simulations</h3>
                <div class="stat-value">${statistics.totalGames}</div>
                <div class="stat-label">game runs</div>
            </div>
            <div class="stat-card">
                <h3>Most Common End</h3>
                <div class="stat-value">${getMostCommonGameOver(statistics.gameOverReasons).reason}</div>
                <div class="stat-label">${getMostCommonGameOver(statistics.gameOverReasons).percentage}% of games</div>
            </div>
            <div class="stat-card">
                <h3>Displayed Trajectories</h3>
                <div class="stat-value">${maxTrajectories}</div>
                <div class="stat-label">sample size</div>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">📊 Game Over Reasons Distribution</div>
            <div id="gameOverChart"></div>
        </div>

        <div class="chart-container">
            <div class="chart-title">⚡ Power Trajectories</div>
            <div class="trajectory-controls">
                <button onclick="showAllTrajectories()" class="active" id="allBtn">Show All</button>
                <button onclick="showSuccessfulTrajectories()" id="successBtn">Long Games Only</button>
                <button onclick="showFailedTrajectories()" id="failBtn">Quick Failures</button>
            </div>
            <div class="power-legend">
                ${powerNames.map((power, index) => {
                    const colors = { 'geld': '#f39c12', 'kinder_glueck': '#e74c3c', 'eltern_nerven': '#9b59b6', 'kinder_gesundheit': '#27ae60' };
                    const color = colors[power] || `hsl(${index * 137.5}, 70%, 50%)`;
                    return `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${color}"></div>
                        <span>${power.replace('_', ' ')}</span>
                    </div>
                `;
                }).join('')}
            </div>
            <div id="trajectoryChart"></div>
        </div>

        <div class="chart-container">
            <div class="chart-title">🎯 Final Power Distributions</div>
            <div id="powerDistributionChart"></div>
        </div>
    </div>

    <script>
        const trajectoryData = ${JSON.stringify(trajectoryData)};
        const powerNames = ${JSON.stringify(powerNames)};
        const statistics = ${JSON.stringify(statistics)};
        
        // Color mapping for powers
        const powerColors = {
            'geld': '#f39c12',
            'kinder_glueck': '#e74c3c', 
            'eltern_nerven': '#9b59b6',
            'kinder_gesundheit': '#27ae60'
        };
        
        function getPowerColor(power, index) {
            return powerColors[power] || \`hsl(\${index * 137.5}, 70%, 50%)\`;
        }
        
        // Game Over Reasons Chart
        function createGameOverChart() {
            const reasons = Object.keys(statistics.gameOverReasons);
            const counts = Object.values(statistics.gameOverReasons);
            
            const data = [{
                type: 'pie',
                labels: reasons.map(r => r.replace('_', ' ')),
                values: counts,
                hole: 0.4,
                textinfo: 'label+percent',
                textposition: 'outside',
                marker: {
                    colors: ['#e74c3c', '#3498db', '#f39c12', '#27ae60', '#9b59b6', '#e67e22']
                }
            }];
            
            const layout = {
                margin: { t: 0, b: 0, l: 0, r: 0 },
                font: { size: 14 },
                showlegend: false
            };
            
            Plotly.newPlot('gameOverChart', data, layout, {responsive: true});
        }
        
        // Power Distribution Chart
        function createPowerDistributionChart() {
            const data = powerNames.map(power => {
                const dist = statistics.powerDistributions[power];
                return {
                    type: 'box',
                    y: trajectoryData.map(t => t.finalPowers[power].value),
                    name: power.replace('_', ' '),
                    marker: { color: getPowerColor(power) },
                    boxpoints: 'outliers'
                };
            });
            
            const layout = {
                title: '',
                yaxis: { title: 'Final Power Value' },
                margin: { t: 20 },
                font: { size: 12 }
            };
            
            Plotly.newPlot('powerDistributionChart', data, layout, {responsive: true});
        }
        
        // Trajectory Chart
        let currentFilter = 'all';
        
        function createTrajectoryChart(filter = 'all') {
            let filteredData = trajectoryData;
            
            if (filter === 'successful') {
                filteredData = trajectoryData.filter(t => t.cardsPlayed > statistics.averageGameLength);
            } else if (filter === 'failed') {
                filteredData = trajectoryData.filter(t => t.cardsPlayed <= statistics.averageGameLength);
            }
            
            const traces = [];
            
            // Create traces for each power across all trajectories
            powerNames.forEach(power => {
                const xData = [];
                const yData = [];
                const textData = [];
                
                filteredData.forEach((traj, trajIndex) => {
                    // Add initial power value
                    if (traj.moves.length > 0) {
                        xData.push(0);
                        yData.push(traj.moves[0].powersBefore[power].value);
                        textData.push(\`Game \${traj.id}: \${power}\`);
                    }
                    
                    // Add power values after each move
                    traj.moves.forEach((move, moveIndex) => {
                        xData.push(moveIndex + 1);
                        // Get power value after this move (from next move's powersBefore or finalPowers)
                        if (moveIndex + 1 < traj.moves.length) {
                            yData.push(traj.moves[moveIndex + 1].powersBefore[power].value);
                        } else {
                            yData.push(traj.finalPowers[power].value);
                        }
                        textData.push(\`Game \${traj.id}: \${power}\`);
                    });
                    
                    // Add separator (null values for line breaks between trajectories)
                    xData.push(null);
                    yData.push(null);
                    textData.push('');
                });
                
                traces.push({
                    type: 'scatter',
                    mode: 'lines+markers',
                    x: xData,
                    y: yData,
                    text: textData,
                    name: power.replace('_', ' '),
                    line: { 
                        color: getPowerColor(power),
                        width: 2
                    },
                    marker: { 
                        size: 4,
                        color: getPowerColor(power)
                    },
                    connectgaps: false
                });
            });
            
            const layout = {
                title: \`Power Trajectories (\${filteredData.length} games)\`,
                xaxis: { 
                    title: 'Cards Played',
                    gridcolor: '#ecf0f1'
                },
                yaxis: { 
                    title: 'Power Value',
                    gridcolor: '#ecf0f1'
                },
                margin: { t: 40 },
                font: { size: 12 },
                hovermode: 'closest',
                plot_bgcolor: '#fafafa'
            };
            
            Plotly.newPlot('trajectoryChart', traces, layout, {responsive: true});
        }
        
        function showAllTrajectories() {
            currentFilter = 'all';
            createTrajectoryChart('all');
            updateButtons('allBtn');
        }
        
        function showSuccessfulTrajectories() {
            currentFilter = 'successful';
            createTrajectoryChart('successful');
            updateButtons('successBtn');
        }
        
        function showFailedTrajectories() {
            currentFilter = 'failed';
            createTrajectoryChart('failed');
            updateButtons('failBtn');
        }
        
        function updateButtons(activeId) {
            ['allBtn', 'successBtn', 'failBtn'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(activeId).classList.add('active');
        }
        
        // Initialize charts
        createGameOverChart();
        createPowerDistributionChart();
        createTrajectoryChart();
    </script>
</body>
</html>`;

  fs.writeFileSync(outputFile, html);
  console.log(`📊 Trajectory visualization saved to: ${outputFile}`);
}

function getMostCommonGameOver(gameOverReasons) {
  const entries = Object.entries(gameOverReasons);
  if (entries.length === 0) return { reason: 'unknown', percentage: 0 };
  
  const [reason, count] = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  const total = Object.values(gameOverReasons).reduce((sum, val) => sum + val, 0);
  const percentage = ((count / total) * 100).toFixed(1);
  
  return { reason: reason.replace('_', ' '), percentage };
}

// Command line usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const inputFile = args[0] || 'monte_carlo_results.json';
  const outputFile = args[1] || 'trajectory_visualization.html';
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.log('Usage: node trajectory_visualizer.js <input_json> [output_html]');
    process.exit(1);
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    generateTrajectoryVisualization(results, outputFile);
  } catch (error) {
    console.error('❌ Error generating visualization:', error.message);
    process.exit(1);
  }
}

export { generateTrajectoryVisualization };