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
    
    // Calculate total enemy count
    const totalEnemies = config.standard + config.shielded;
    const playerPos = this.game.player.mesh.position;
    
    // Wave 1: Spawn behind player, then rotate to face standard enemies
    if (this.currentWave === 1) {
      // Spawn enemies BEHIND the player initially
      const behindDirection = new THREE.Vector3();
      this.game.camera.getWorldDirection(behindDirection);
      behindDirection.multiplyScalar(-1); // Reverse direction
      behindDirection.y = 0;
      behindDirection.normalize();
      
      // Calculate spawn positions behind player
      const behindAngle = Math.atan2(behindDirection.z, behindDirection.x);
      const standardPositions = [];
      const spreadAngle = Math.PI * 0.3; // 54 degree arc for standard
      
      // Spawn standard enemies in center (behind player)
      for (let i = 0; i < config.standard; i++) {
        const offsetAngle = (i / Math.max(config.standard - 1, 1) - 0.5) * spreadAngle;
        const angle = behindAngle + offsetAngle;
        const distance = 20 + (Math.random() - 0.5) * 3;
        
        const pos = new THREE.Vector3(
          playerPos.x + Math.cos(angle) * distance,
          1.5,
          playerPos.z + Math.sin(angle) * distance
        );
        standardPositions.push(pos);
        this.game.spawnEnemy('standard', pos);
      }
      
      // Spawn shielded enemies further to the sides
      for (let i = 0; i < config.shielded; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const offsetAngle = side * Math.PI * 0.35; // 63 degrees to each side
        const angle = behindAngle + offsetAngle;
        const distance = 22 + (Math.random() - 0.5) * 3;
        
        const pos = new THREE.Vector3(
          playerPos.x + Math.cos(angle) * distance,
          1.5,
          playerPos.z + Math.sin(angle) * distance
        );
        this.game.spawnEnemy('shielded', pos);
      }
      
      // Rotate player 180 degrees to face the standard enemies
      setTimeout(() => {
        if (standardPositions.length > 0) {
          // Calculate center of standard enemy formation
          const centerPos = standardPositions[Math.floor(standardPositions.length / 2)];
          const directionToEnemies = new THREE.Vector3()
            .subVectors(centerPos, this.game.camera.position)
            .normalize();
          
          // Calculate yaw angle to face enemies
          const targetYaw = Math.atan2(directionToEnemies.x, directionToEnemies.z);
          
          // Apply rotation to player controls
          if (this.game.player.controls) {
            this.game.player.controls.getObject().rotation.y = targetYaw;
          }
        }
      }, 100);
    } else {
      // Other waves: Mixed spawning but still in front
      const spawnPositions = this.getSpawnPositions(totalEnemies, playerPos, 0);
      let posIndex = 0;
      
      // Spawn standard enemies
      for (let i = 0; i < config.standard; i++) {
        this.game.spawnEnemy('standard', spawnPositions[posIndex++]);
      }
      
      // Spawn shielded enemies
      for (let i = 0; i < config.shielded; i++) {
        this.game.spawnEnemy('shielded', spawnPositions[posIndex++]);
      }
    }
    
    this.enemiesRemaining = totalEnemies;
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
  
  getSpawnPositions(count, playerPos, angleOffset = 0) {
    const positions = [];
    const spawnDistance = 20; // Distance in front of player
    const spreadAngle = Math.PI * 0.5; // 90 degrees arc (narrower)
    
    // Get player's forward direction (camera facing)
    const cameraDirection = new THREE.Vector3();
    this.game.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Base angle from camera direction
    const baseAngle = Math.atan2(cameraDirection.z, cameraDirection.x);
    
    for (let i = 0; i < count; i++) {
      // Spread enemies in arc in front of player
      const offsetAngle = (i / Math.max(count - 1, 1) - 0.5) * spreadAngle + angleOffset;
      const angle = baseAngle + offsetAngle;
      
      // Add some randomness to distance
      const distance = spawnDistance + (Math.random() - 0.5) * 3;
      
      const spawnPos = new THREE.Vector3(
        playerPos.x + Math.cos(angle) * distance,
        1.5, // Enemy height
        playerPos.z + Math.sin(angle) * distance
      );
      
      positions.push(spawnPos);
    }
    
    return positions;
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
