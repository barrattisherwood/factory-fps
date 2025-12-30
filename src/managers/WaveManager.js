import * as THREE from 'three';

/**
 * Wave Configuration - 5 escalating waves
 */
const WAVE_CONFIG = {
  1: { standard: 3, shielded: 2, label: "Wave 1: Scout Units" },
  2: { standard: 4, shielded: 4, label: "Wave 2: Strike Force" },
  3: { standard: 6, shielded: 6, label: "Wave 3: Heavy Assault" },
  4: { standard: 7, shielded: 8, label: "Wave 4: Elite Squadron" },
  5: { standard: 10, shielded: 10, label: "Wave 5: Final Siege" }
};

/**
 * WaveManager - Controls wave spawning and progression
 */
export class WaveManager {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.totalWaves = 5;
    this.enemiesRemaining = 0;
    this.waveTransitionTime = 5; // seconds
    this.countdownInterval = null;
  }
  
  startNextWave() {
    this.currentWave++;
    
    if (this.currentWave > this.totalWaves) {
      // Victory!
      this.game.stateManager.changeState('VICTORY');
      return;
    }
    
    const config = WAVE_CONFIG[this.currentWave];
    this.spawnWave(config);
    
    this.game.events.emit('wave:started', {
      wave: this.currentWave,
      total: this.totalWaves,
      enemies: config.standard + config.shielded,
      label: config.label
    });
  }
  
  spawnWave(config) {
    // Clear any remaining enemies
    this.game.clearEnemies();
    
    // Spawn standard enemies
    for (let i = 0; i < config.standard; i++) {
      const pos = this.getRandomSpawnPosition();
      this.game.spawnEnemy('standard', pos);
    }
    
    // Spawn shielded enemies
    for (let i = 0; i < config.shielded; i++) {
      const pos = this.getRandomSpawnPosition();
      this.game.spawnEnemy('shielded', pos);
    }
    
    this.enemiesRemaining = config.standard + config.shielded;
    console.log(`Wave ${this.currentWave} spawned: ${this.enemiesRemaining} enemies`);
  }
  
  onEnemyKilled() {
    this.enemiesRemaining--;
    this.game.events.emit('wave:enemy_killed', { remaining: this.enemiesRemaining });
    
    if (this.enemiesRemaining <= 0) {
      // Wave complete!
      this.onWaveComplete();
    }
  }
  
  onWaveComplete() {
    this.game.events.emit('wave:completed', { wave: this.currentWave });
    
    if (this.currentWave >= this.totalWaves) {
      this.game.stateManager.changeState('VICTORY');
    } else {
      this.game.stateManager.changeState('WAVE_TRANSITION');
      this.startTransitionCountdown();
    }
  }
  
  startTransitionCountdown() {
    let timeLeft = this.waveTransitionTime;
    
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.game.events.emit('wave:countdown', { timeLeft });
    
    this.countdownInterval = setInterval(() => {
      timeLeft--;
      this.game.events.emit('wave:countdown', { timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.game.stateManager.changeState('PLAYING');
        this.startNextWave();
      }
    }, 1000);
  }
  
  getRandomSpawnPosition() {
    // Spawn enemies in circle around player, at distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10; // 15-25 units away
    
    return new THREE.Vector3(
      Math.cos(angle) * distance,
      1.5, // Enemy height
      Math.sin(angle) * distance
    );
  }
  
  reset() {
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
  
  getWaveConfig(waveNumber) {
    return WAVE_CONFIG[waveNumber];
  }
}
