import * as THREE from 'three';

/**
 * Level Configuration - 3 levels before boss
 */
const LEVEL_CONFIG = {
  1: {
    title: 'LEVEL 1',
    description: 'Industrial Zone - First Contact',
    enemyCount: 8,
    enemies: { standard: 5, shielded: 3, heavy: 0 },
    arena: 'industrial',
    timeLimit: null,
    completionReward: { metal: 50, energy: 30 }
  },
  2: {
    title: 'LEVEL 2',
    description: 'Industrial Zone - Heavy Resistance',
    enemyCount: 10,
    enemies: { standard: 4, shielded: 4, heavy: 2 },
    arena: 'industrial',
    completionReward: { metal: 75, energy: 50 }
  },
  3: {
    title: 'LEVEL 3',
    description: 'Industrial Zone - Final Approach',
    enemyCount: 14,
    enemies: { standard: 4, shielded: 6, heavy: 4 },
    arena: 'industrial',
    completionReward: { metal: 100, energy: 75 }
  },
  4: {
    title: 'BOSS',
    description: 'Boss Encounter - Flux Warden',
    enemyCount: 1,
    enemies: { boss: 1 },
    arena: 'boss',
    completionReward: { metal: 0, energy: 0 }  // Boss has special drops
  }
};

/**
 * RunManager - Manages roguelike run structure (3 levels + boss)
 */
export class RunManager {
  constructor(game) {
    this.game = game;
    this.currentRun = null;
    this.runNumber = 0;
    this.enemiesRemaining = 0;
    this.currentLevel = 0;
    this.LEVEL_CONFIG = LEVEL_CONFIG; // Expose for external access
  }
  
  startNewRun() {
    this.runNumber++;
    this.currentRun = {
      runId: this.runNumber,
      startTime: Date.now(),
      currentLevel: 0,
      stats: {
        enemiesKilled: 0,
        damageTaken: 0,
        resourcesCollected: { metal: 0, energy: 0 }
      }
    };
    
    this.game.events.emit('run:started', this.currentRun);
    console.log(`Run #${this.runNumber} started`);
    
    // Start first level
    this.startNextLevel();
  }
  
  startNextLevel() {
    this.currentRun.currentLevel++;
    this.currentLevel = this.currentRun.currentLevel;
    
    if (this.currentRun.currentLevel > 3) {
      // Start boss fight
      this.startBossFight();
      return;
    }
    
    const config = LEVEL_CONFIG[this.currentRun.currentLevel];
    this.loadLevel(config);
    
    this.game.events.emit('level:started', {
      level: this.currentRun.currentLevel,
      total: 3,
      config: config
    });
  }
  
  loadLevel(config) {
    // Clear existing enemies
    this.game.clearEnemies();
    this.game.clearOrbs();
    
    // Spawn enemies for this level
    const totalEnemies = (config.enemies.standard || 0) + 
                        (config.enemies.shielded || 0) + 
                        (config.enemies.heavy || 0);
    
    const spawnPoints = this.getSpawnPoints(totalEnemies);
    let spawnIndex = 0;
    
    // Spawn standard enemies
    for (let i = 0; i < (config.enemies.standard || 0); i++) {
      this.game.spawnEnemy('standard', spawnPoints[spawnIndex++]);
    }
    
    // Spawn shielded enemies
    for (let i = 0; i < (config.enemies.shielded || 0); i++) {
      this.game.spawnEnemy('shielded', spawnPoints[spawnIndex++]);
    }
    
    // Spawn heavy enemies (if unlocked)
    for (let i = 0; i < (config.enemies.heavy || 0); i++) {
      this.game.spawnEnemy('heavy', spawnPoints[spawnIndex++]);
    }
    
    this.enemiesRemaining = totalEnemies;
    console.log(`Level ${this.currentRun.currentLevel} loaded: ${totalEnemies} enemies`);
  }
  
  spawnCurrentLevel() {
    const config = LEVEL_CONFIG[this.currentRun.currentLevel];
    this.loadLevel(config);
  }
  
  getSpawnPoints(enemyCount) {
    const points = [];
    const radius = 20;
    
    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = radius + (Math.random() * 5);
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * distance,
        1.5,
        Math.sin(angle) * distance
      ));
    }
    
    return points;
  }
  
  onEnemyKilled() {
    this.enemiesRemaining--;
    this.currentRun.stats.enemiesKilled++;
    
    this.game.events.emit('level:enemy_killed', { 
      remaining: this.enemiesRemaining 
    });
    
    if (this.enemiesRemaining <= 0) {
      // Level complete!
      this.onLevelComplete();
    }
  }
  
  onLevelComplete() {
    const config = LEVEL_CONFIG[this.currentRun.currentLevel];
    
    // Award completion rewards
    this.game.resourceManager.add('metal', config.completionReward.metal);
    this.game.resourceManager.add('energy', config.completionReward.energy);
    
    this.currentRun.stats.resourcesCollected.metal += config.completionReward.metal;
    this.currentRun.stats.resourcesCollected.energy += config.completionReward.energy;
    
    this.game.events.emit('level:completed', {
      level: this.currentRun.currentLevel,
      rewards: config.completionReward
    });
    
    console.log(`Level ${this.currentRun.currentLevel} complete!`);
    
    // Transition to next level
    this.game.stateManager.changeState('LEVEL_TRANSITION');
    
    setTimeout(() => {
      this.game.stateManager.changeState('PLAYING');
      this.startNextLevel();
    }, 3000);
  }
  
  onRunFailed() {
    const runData = {
      ...this.currentRun,
      endTime: Date.now(),
      result: 'failed',
      levelsCompleted: this.currentRun.currentLevel - 1
    };
    
    this.game.events.emit('run:failed', runData);
    console.log('Run failed at level', this.currentRun.currentLevel);
    this.game.stateManager.changeState('RUN_FAILED');
  }
  
  onRunSuccess() {
    const runData = {
      ...this.currentRun,
      endTime: Date.now(),
      result: 'success'
    };
    
    this.game.events.emit('run:success', runData);
    console.log('Run completed successfully!');
    this.game.stateManager.changeState('RUN_SUCCESS');
  }
  
  startBossFight() {
    this.game.events.emit('boss:starting');
    console.log('Starting boss fight!');
    this.game.loadBossFight();
  }
  
  reset() {
    this.currentRun = null;
    this.enemiesRemaining = 0;
  }
  
  getLevelConfig(level) {
    return LEVEL_CONFIG[level];
  }
  
  getCurrentStats() {
    return this.currentRun ? { ...this.currentRun.stats } : null;
  }
}
