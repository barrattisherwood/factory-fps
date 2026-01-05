export class WaveManager {
  constructor(game, eventBus) {
    this.game = game;
    this.eventBus = eventBus;
    
    this.currentWave = 0;
    this.maxWaves = 5;
    this.isActive = false;
    this.isBetweenWaves = false;
    this.countdownTime = 5; // seconds between waves
    this.countdownTimer = 0;
    
    // Wave configurations (enemies per wave)
    this.waveConfigs = [
      { standard: 3, shielded: 2 },  // Wave 1: 5 total
      { standard: 4, shielded: 4 },  // Wave 2: 8 total
      { standard: 6, shielded: 6 },  // Wave 3: 12 total
      { standard: 7, shielded: 8 },  // Wave 4: 15 total
      { standard: 10, shielded: 10 } // Wave 5: 20 total
    ];
    
    this.createWaveUI();
  }

  createWaveUI() {
    // Wave counter (top-center)
    this.waveCounter = document.createElement('div');
    this.waveCounter.id = 'wave-counter';
    Object.assign(this.waveCounter.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Courier New', monospace",
      zIndex: '100',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px 30px',
      border: '2px solid #00ffcc',
      borderRadius: '5px',
      textAlign: 'center',
      display: 'none'
    });
    document.body.appendChild(this.waveCounter);

    // Wave transition overlay
    this.waveTransition = document.createElement('div');
    this.waveTransition.id = 'wave-transition';
    Object.assign(this.waveTransition.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'none',
      zIndex: '400',
      fontFamily: "'Courier New', monospace"
    });

    const transitionContent = document.createElement('div');
    Object.assign(transitionContent.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#e0e0e0'
    });

    this.waveTitle = document.createElement('div');
    Object.assign(this.waveTitle.style, {
      fontSize: '48px',
      color: '#00ffcc',
      marginBottom: '20px',
      textShadow: '0 0 20px rgba(0,255,204,0.8)'
    });
    transitionContent.appendChild(this.waveTitle);

    this.waveSubtitle = document.createElement('div');
    Object.assign(this.waveSubtitle.style, {
      fontSize: '24px',
      color: '#ff6600',
      marginBottom: '40px'
    });
    transitionContent.appendChild(this.waveSubtitle);

    this.countdownDisplay = document.createElement('div');
    Object.assign(this.countdownDisplay.style, {
      fontSize: '32px',
      color: '#e0e0e0'
    });
    transitionContent.appendChild(this.countdownDisplay);

    this.waveTransition.appendChild(transitionContent);
    document.body.appendChild(this.waveTransition);
  }

  startWaves() {
    this.isActive = true;
    this.currentWave = 0;
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    
    if (this.currentWave > this.maxWaves) {
      this.onAllWavesComplete();
      return;
    }

    this.showWaveTransition();
  }

  showWaveTransition() {
    this.isBetweenWaves = true;
    const config = this.waveConfigs[this.currentWave - 1];
    const totalEnemies = config.standard + config.shielded;

    this.waveTitle.textContent = `WAVE ${this.currentWave} INCOMING...`;
    this.waveSubtitle.textContent = `${totalEnemies} Hostiles Detected`;
    
    this.countdownTimer = this.countdownTime;
    this.waveTransition.style.display = 'block';
    
    this.updateCountdown();
  }

  updateCountdown() {
    if (!this.isBetweenWaves) return;

    const progress = Math.floor((this.countdownTimer / this.countdownTime) * 10);
    const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);
    this.countdownDisplay.textContent = `Ready: [${bar}] (${Math.ceil(this.countdownTimer)}s)`;

    if (this.countdownTimer <= 0) {
      this.waveTransition.style.display = 'none';
      this.isBetweenWaves = false;
      this.spawnWave();
    }
  }

  spawnWave() {
    const config = this.waveConfigs[this.currentWave - 1];
    
    // Reset player position between waves
    this.game.player.resetPosition();
    
    // Clear existing enemies
    this.game.clearEnemies();
    
    // Spawn standard robots in front (facing -Z direction, 180° to 360°)
    for (let i = 0; i < config.standard; i++) {
      const spreadAngle = Math.PI / (config.standard + 1); // Spread across front 180°
      const angle = Math.PI + spreadAngle * (i + 1); // 180° to 360° (front arc)
      const radius = 30 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.game.spawnEnemy(x, z, 'standard');
    }
    
    // Spawn shielded robots behind/sides (0° to 180°)
    for (let i = 0; i < config.shielded; i++) {
      const spreadAngle = Math.PI / (config.shielded + 1); // Spread across back 180°
      const angle = spreadAngle * (i + 1); // 0° to 180° (back arc)
      const radius = 30 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.game.spawnEnemy(x, z, 'shielded');
    }

    // Show wave counter
    this.updateWaveCounter();
    this.waveCounter.style.display = 'block';

    this.eventBus.emit('wave:started', { 
      wave: this.currentWave, 
      enemies: config.standard + config.shielded 
    });
  }

  updateWaveCounter() {
    const remainingEnemies = this.game.enemies.length;
    this.waveCounter.innerHTML = `
      <div style="font-size: 20px; color: #00ffcc; font-weight: bold;">WAVE ${this.currentWave}/${this.maxWaves}</div>
      <div style="font-size: 16px; color: #e0e0e0; margin-top: 5px;">${remainingEnemies} Enemies</div>
    `;
  }

  onWaveCleared() {
    if (!this.isActive || this.isBetweenWaves) return;

    this.eventBus.emit('wave:cleared', { wave: this.currentWave });

    if (this.currentWave < this.maxWaves) {
      // Start next wave after delay
      setTimeout(() => {
        if (this.isActive) {
          this.startNextWave();
        }
      }, 1000);
    } else {
      // All waves complete
      this.onAllWavesComplete();
    }
  }

  onAllWavesComplete() {
    this.isActive = false;
    this.waveCounter.style.display = 'none';
    this.eventBus.emit('game:victory');
  }

  update(deltaTime) {
    if (this.isBetweenWaves) {
      this.countdownTimer -= deltaTime;
      this.updateCountdown();
    } else if (this.isActive) {
      this.updateWaveCounter();
      
      // Check if wave is cleared
      if (this.game.enemies.length === 0) {
        this.onWaveCleared();
      }
    }
  }

  reset() {
    this.currentWave = 0;
    this.isActive = false;
    this.isBetweenWaves = false;
    this.waveCounter.style.display = 'none';
    this.waveTransition.style.display = 'none';
  }

  hide() {
    this.waveCounter.style.display = 'none';
    this.waveTransition.style.display = 'none';
  }
}
