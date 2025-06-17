#!/usr/bin/env node

// Extended Monte Carlo analysis runner
// Runs simulations for a specified duration and generates comprehensive analysis

import fs from 'fs';
import { HeadlessLoader, GameSimulator } from './monte_carlo_simulation.js';
import { generateTrajectoryVisualization } from './trajectory_visualizer.js';

async function runExtendedAnalysis(gameName = 'eltern_simulator', durationMinutes = 60) {
  console.log(`🎮 Starting extended Monte Carlo analysis for: ${gameName}`);
  console.log(`⏰ Running for ${durationMinutes} minutes...`);
  
  const startTime = Date.now();
  const endTime = startTime + (durationMinutes * 60 * 1000);
  
  try {
    const config = await HeadlessLoader.loadGameConfig(gameName);
    const simulator = new GameSimulator(config);
    
    let totalSimulations = 0;
    let allResults = [];
    let batchSize = 1000;
    
    console.log('🚀 Beginning simulation batches...');
    
    while (Date.now() < endTime) {
      const batchStartTime = Date.now();
      console.log(`\\n📊 Running batch ${Math.floor(totalSimulations / batchSize) + 1} (${batchSize} simulations)...`);
      
      const progressCallback = (current, total) => {
        if (current % 200 === 0) {
          const percent = ((current / total) * 100).toFixed(1);
          const elapsed = ((Date.now() - batchStartTime) / 1000).toFixed(1);
          process.stdout.write(`\\r   ⏳ Batch progress: ${current}/${total} (${percent}%) - ${elapsed}s elapsed`);
        }
      };
      
      const batchResults = simulator.runMonteCarloSimulation(batchSize, progressCallback);
      allResults = allResults.concat(batchResults.simulations);
      totalSimulations += batchSize;
      
      const batchTime = ((Date.now() - batchStartTime) / 1000).toFixed(2);
      const totalTime = ((Date.now() - startTime) / 60000).toFixed(1);
      const remainingTime = ((endTime - Date.now()) / 60000).toFixed(1);
      
      console.log(`\\n   ✅ Batch completed in ${batchTime}s`);
      console.log(`   📈 Total simulations: ${totalSimulations}`);
      console.log(`   ⏱️  Total time: ${totalTime} minutes`);
      console.log(`   🕐 Remaining: ${remainingTime} minutes`);
      
      // Check if we should continue
      if (Date.now() >= endTime) {
        break;
      }
      
      // Adaptive batch sizing based on performance
      const simulationsPerSecond = batchSize / (batchTime);
      const remainingSeconds = (endTime - Date.now()) / 1000;
      const estimatedRemainingSimulations = Math.floor(simulationsPerSecond * remainingSeconds);
      
      if (estimatedRemainingSimulations < batchSize && estimatedRemainingSimulations > 0) {
        batchSize = estimatedRemainingSimulations;
        console.log(`   🎯 Adjusting final batch size to: ${batchSize}`);
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 60000).toFixed(2);
    console.log(`\\n🏁 Analysis completed!`);
    console.log(`📊 Total simulations: ${totalSimulations}`);
    console.log(`⏱️  Total time: ${totalTime} minutes`);
    console.log(`🚀 Average rate: ${(totalSimulations / (totalTime * 60)).toFixed(1)} simulations/second`);
    
    // Calculate comprehensive statistics
    console.log('\\n📈 Calculating comprehensive statistics...');
    const results = calculateExtendedStatistics(allResults, config);
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `extended_analysis_${gameName}_${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`💾 Results saved to: ${resultsFile}`);
    
    // Generate visualization
    console.log('🎨 Generating visualization...');
    const visualizationFile = `extended_analysis_${gameName}_${timestamp}.html`;
    generateTrajectoryVisualization(results, visualizationFile);
    
    // Print summary
    printAnalysisSummary(results);
    
    console.log(`\\n🎉 Extended analysis complete!`);
    console.log(`📄 Data: ${resultsFile}`);
    console.log(`📊 Visualization: ${visualizationFile}`);
    
  } catch (error) {
    console.error('❌ Error during extended analysis:', error.message);
    process.exit(1);
  }
}

function calculateExtendedStatistics(simulations, config) {
  const statistics = {
    totalGames: simulations.length,
    averageGameLength: 0,
    gameOverReasons: {},
    powerDistributions: {},
    trajectoryPatterns: {
      shortGames: 0,    // < 3 cards
      mediumGames: 0,   // 3-10 cards  
      longGames: 0,     // > 10 cards
      extremelyLongGames: 0  // > 20 cards
    },
    cardPlayPatterns: {},
    powerCorrelations: {},
    timeToGameOver: {}
  };
  
  // Basic statistics
  statistics.averageGameLength = simulations.reduce((sum, sim) => sum + sim.cardsPlayed, 0) / simulations.length;
  
  // Game over reasons
  simulations.forEach(sim => {
    if (sim.gameOverInfo) {
      const reason = `${sim.gameOverInfo.power}_${sim.gameOverInfo.boundary}`;
      statistics.gameOverReasons[reason] = (statistics.gameOverReasons[reason] || 0) + 1;
    }
  });
  
  // Power distributions
  config.powers.forEach(power => {
    const values = simulations.map(sim => sim.finalPowers[power.name].value);
    statistics.powerDistributions[power.name] = {
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
      standardDeviation: calculateStandardDeviation(values)
    };
  });
  
  // Trajectory patterns
  simulations.forEach(sim => {
    if (sim.cardsPlayed < 3) statistics.trajectoryPatterns.shortGames++;
    else if (sim.cardsPlayed <= 10) statistics.trajectoryPatterns.mediumGames++;
    else if (sim.cardsPlayed <= 20) statistics.trajectoryPatterns.longGames++;
    else statistics.trajectoryPatterns.extremelyLongGames++;
  });
  
  // Card play patterns
  const cardCounts = {};
  simulations.forEach(sim => {
    sim.moves.forEach(move => {
      cardCounts[move.cardId] = (cardCounts[move.cardId] || 0) + 1;
    });
  });
  
  statistics.cardPlayPatterns = Object.entries(cardCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [card, count]) => {
      obj[card] = {
        count,
        percentage: ((count / simulations.length) * 100).toFixed(1)
      };
      return obj;
    }, {});
  
  // Time to game over analysis
  Object.keys(statistics.gameOverReasons).forEach(reason => {
    const relevantSims = simulations.filter(sim => 
      sim.gameOverInfo && `${sim.gameOverInfo.power}_${sim.gameOverInfo.boundary}` === reason
    );
    if (relevantSims.length > 0) {
      const times = relevantSims.map(sim => sim.cardsPlayed);
      statistics.timeToGameOver[reason] = {
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times)
      };
    }
  });
  
  return {
    simulations: simulations.slice(0, 200), // Limit stored simulations for file size
    statistics
  };
}

function calculateStandardDeviation(values) {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.sqrt(variance);
}

function printAnalysisSummary(results) {
  const { statistics } = results;
  
  console.log('\\n' + '='.repeat(60));
  console.log('📊 EXTENDED ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\\n🎮 GAME OVERVIEW:`);
  console.log(`   Total simulations: ${statistics.totalGames.toLocaleString()}`);
  console.log(`   Average game length: ${statistics.averageGameLength.toFixed(2)} cards`);
  
  console.log(`\\n💀 GAME OVER ANALYSIS:`);
  Object.entries(statistics.gameOverReasons)
    .sort(([,a], [,b]) => b - a)
    .forEach(([reason, count]) => {
      const percentage = ((count / statistics.totalGames) * 100).toFixed(2);
      const timeInfo = statistics.timeToGameOver[reason];
      console.log(`   ${reason.replace('_', ' ')}: ${count.toLocaleString()} (${percentage}%) - avg ${timeInfo.averageTime.toFixed(1)} cards`);
    });
  
  console.log(`\\n📏 GAME LENGTH PATTERNS:`);
  const patterns = statistics.trajectoryPatterns;
  console.log(`   Short games (<3 cards): ${patterns.shortGames.toLocaleString()} (${((patterns.shortGames/statistics.totalGames)*100).toFixed(1)}%)`);
  console.log(`   Medium games (3-10 cards): ${patterns.mediumGames.toLocaleString()} (${((patterns.mediumGames/statistics.totalGames)*100).toFixed(1)}%)`);
  console.log(`   Long games (11-20 cards): ${patterns.longGames.toLocaleString()} (${((patterns.longGames/statistics.totalGames)*100).toFixed(1)}%)`);
  console.log(`   Extremely long games (>20 cards): ${patterns.extremelyLongGames.toLocaleString()} (${((patterns.extremelyLongGames/statistics.totalGames)*100).toFixed(1)}%)`);
  
  console.log(`\\n⚡ POWER ANALYSIS:`);
  Object.entries(statistics.powerDistributions).forEach(([power, stats]) => {
    console.log(`   ${power.replace('_', ' ')}:`);
    console.log(`     Average: ${stats.average.toFixed(1)} ± ${stats.standardDeviation.toFixed(1)}`);
    console.log(`     Range: ${stats.min} - ${stats.max} (median: ${stats.median})`);
  });
  
  console.log(`\\n🎯 MOST PLAYED CARDS:`);
  Object.entries(statistics.cardPlayPatterns).slice(0, 5).forEach(([card, info]) => {
    console.log(`   ${card}: ${info.count.toLocaleString()} plays (${info.percentage}% of games)`);
  });
  
  console.log('\\n' + '='.repeat(60));
}

// Command line usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const gameName = args[0] || 'eltern_simulator';
  const durationMinutes = parseInt(args[1]) || 60;
  
  runExtendedAnalysis(gameName, durationMinutes);
}

export { runExtendedAnalysis };