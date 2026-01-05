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
    this.levelCompleteShown = false; // Initialize flag
    
    // Reset player health for new run
    this.game.player.resetHealth();
    
    // Remove any lingering level complete overlays
    const existingOverlay = document.getElementById('level-complete-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
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
    // Reset level complete flag for new level
    this.levelCompleteShown = false;
    
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
    
    // Reset player position for the new level
    const spawnPos = new THREE.Vector3(0, 1.7, 0);
    const spawnFacing = Math.PI; // Face backward toward enemies
    this.game.player.resetPosition(spawnPos, spawnFacing, () => {
      // Lock pointer after position is set
      if (this.game.player && this.game.player.lock) {
        this.game.player.lock();
      }
    });
    
    // Clean up any lingering boss HP bar
    const bossHpBar = document.getElementById('boss-health-bar');
    if (bossHpBar) {
      bossHpBar.remove();
    }
    
    // Spawn enemies for this level
    const totalEnemies = (config.enemies.standard || 0) + 
                        (config.enemies.shielded || 0) + 
                        (config.enemies.heavy || 0);
    
    const spawnPoints = this.getSpawnPoints(totalEnemies);
    let spawnIndex = 0;
    
    const currentLevel = this.currentRun.currentLevel;
    
    // Spawn standard enemies
    for (let i = 0; i < (config.enemies.standard || 0); i++) {
      this.game.spawnEnemy('standard', spawnPoints[spawnIndex++], currentLevel);
    }
    
    // Spawn shielded enemies
    for (let i = 0; i < (config.enemies.shielded || 0); i++) {
      this.game.spawnEnemy('shielded', spawnPoints[spawnIndex++], currentLevel);
    }
    
    // Spawn heavy enemies (if unlocked)
    for (let i = 0; i < (config.enemies.heavy || 0); i++) {
      this.game.spawnEnemy('heavy', spawnPoints[spawnIndex++], currentLevel);
    }
    
    this.enemiesRemaining = totalEnemies;
    console.log(`Level ${this.currentRun.currentLevel} loaded: ${totalEnemies} enemies`);
    
    // Show tutorial hints for Level 1
    if (this.currentRun.currentLevel === 1) {
      this.showTutorialHints();
    }
  }
  
  showTutorialHints() {
    const hints = [
      { text: "TUTORIAL: Enemies won't chase you yet - take your time!", delay: 1000, duration: 5000 },
      { text: "Aim for the glowing weak spots for critical damage!", delay: 7000, duration: 4000 },
      { text: "Press 1 and 2 to switch ammo types", delay: 12000, duration: 4000 },
      { text: "Collect orbs to gather resources", delay: 17000, duration: 4000 },
      { text: "Press TAB to open factory and craft ammo", delay: 22000, duration: 4000 }
    ];
    
    hints.forEach(hint => {
      setTimeout(() => {
        this.showHint(hint.text, hint.duration);
      }, hint.delay);
    });
  }
  
  showHint(text, duration = 3000) {
    const existing = document.getElementById('tutorial-hint');
    if (existing) existing.remove();
    
    const hint = document.createElement('div');
    hint.id = 'tutorial-hint';
    hint.className = 'tutorial-hint';
    hint.textContent = text;
    
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 500);
    }, duration);
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
    // Prevent duplicate calls
    if (this.levelCompleteShown) {
      return;
    }
    this.levelCompleteShown = true;
    
    console.log(`Level ${this.currentRun.currentLevel} complete!`);
    
    // Don't pause game - let player collect remaining orbs
    // Show level complete overlay
    this.showLevelCompleteScreen();
  }
  
  showLevelCompleteScreen() {
    // Remove any existing overlay first
    const existingOverlay = document.getElementById('level-complete-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    const config = LEVEL_CONFIG[this.currentRun.currentLevel];
    const overlay = document.createElement('div');
    overlay.id = 'level-complete-overlay';
    overlay.className = 'level-transition-overlay';
    
    const remainingOrbs = this.game.orbs.length;
    
    overlay.innerHTML = `
      <div class="level-complete-container">
        <h2>✓ LEVEL ${this.currentRun.currentLevel} CLEARED</h2>
        <div class="level-stats">
          <p style="color: #00ffcc; font-size: 18px; margin-bottom: 15px;">Orbs Remaining: ${remainingOrbs}</p>
          <p class="proceed-hint">⌨️ PRESS [SPACE] TO ${remainingOrbs > 0 ? 'COLLECT & CONTINUE' : 'CONTINUE'} ⌨️</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    console.log('Level complete screen displayed - Press SPACE to continue');
    
    // Player can still move and collect orbs during this screen
    
    // Store handler reference so we can remove it later
    const spaceHandler = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        console.log('Space pressed - proceeding to next level');
        this.proceedToNextLevel();
        overlay.remove();
        window.removeEventListener('keydown', spaceHandler);
      }
    };
    
    // Store the handler so we can clean it up
    this.currentSpaceHandler = spaceHandler;
    window.addEventListener('keydown', spaceHandler);
  }
  
  proceedToNextLevel() {
    console.log('proceedToNextLevel called');
    
    // Remove any existing space handlers to prevent conflicts
    if (this.currentSpaceHandler) {
      window.removeEventListener('keydown', this.currentSpaceHandler);
      this.currentSpaceHandler = null;
    }
    
    // Remove any existing overlay
    const existingOverlay = document.getElementById('level-complete-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Auto-collect any remaining orbs
    const collected = { metal: 0, energy: 0, thermal_core: 0 };
    
    // Collect all remaining orbs
    this.game.orbs.forEach(orb => {
      const ammoType = orb.ammoType || 'kinetic';
      const ammoAmount = orb.ammoAmount || 10;
      
      this.game.resourceManager.collectResource(orb.resourceType, ammoAmount);
      collected[orb.resourceType] = (collected[orb.resourceType] || 0) + ammoAmount;
      
      // Remove orb from scene
      if (orb.getMesh() && orb.getMesh().parent) {
        orb.getMesh().parent.remove(orb.getMesh());
      }
    });
    
    // Clear orbs array
    this.game.orbs = [];
    
    // Show what was collected if anything
    if (Object.values(collected).some(v => v > 0)) {
      console.log('Auto-collected:', collected);
    }
    
    // Award completion rewards
    const config = LEVEL_CONFIG[this.currentRun.currentLevel];
    this.game.resourceManager.add('metal', config.completionReward.metal);
    this.game.resourceManager.add('energy', config.completionReward.energy);
    
    this.currentRun.stats.resourcesCollected.metal += config.completionReward.metal;
    this.currentRun.stats.resourcesCollected.energy += config.completionReward.energy;
    
    this.game.events.emit('level:completed', {
      level: this.currentRun.currentLevel,
      rewards: config.completionReward
    });
    
    console.log('Transitioning to next level...');
    
    // Check if next level is boss fight
    const nextLevel = this.currentRun.currentLevel + 1;
    if (nextLevel > 3) {
      // Go directly to boss fight without intermediate transition
      this.game.stateManager.changeState('PLAYING');
      setTimeout(() => {
        this.startNextLevel();
      }, 100);
      return;
    }
    
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
    // Remove any lingering level complete overlays
    const existingOverlay = document.getElementById('level-complete-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Clean up space handler
    if (this.currentSpaceHandler) {
      window.removeEventListener('keydown', this.currentSpaceHandler);
      this.currentSpaceHandler = null;
    }
    
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
