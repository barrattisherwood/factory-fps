/**
 * MenuManager - Handles all menu screens and UI interactions
 * Phase 9: Added Hub, Level Transition, Run Success/Failed screens
 */
export class MenuManager {
  constructor(game) {
    this.game = game;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Main Menu
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.game.soundManager.init();
      this.game.stateManager.changeState('HUB');
    });
    
    document.getElementById('btn-howto')?.addEventListener('click', () => {
      this.showHowToPlay();
    });
    
    document.getElementById('btn-credits')?.addEventListener('click', () => {
      this.showCredits();
    });
    
    // How To Play
    document.getElementById('btn-back-from-howto')?.addEventListener('click', () => {
      this.showMainMenu();
    });
    
    // Credits
    document.getElementById('btn-back-from-credits')?.addEventListener('click', () => {
      this.showMainMenu();
    });
    
    // Hub
    document.getElementById('btn-start-run')?.addEventListener('click', () => {
      this.game.startRun();
    });
    
    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirm('Reset ALL progress? This cannot be undone!')) {
        this.game.resetProgress();
      }
    });
    
    // Pause Menu
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.game.resumeGame();
    });
    
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.game.restartRun();
    });
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
      this.game.quitToHub();
    });
    
    // Run Success
    document.getElementById('btn-next-run')?.addEventListener('click', () => {
      this.game.startRun();
    });
    
    document.getElementById('btn-success-hub')?.addEventListener('click', () => {
      this.game.stateManager.changeState('HUB');
    });
    
    // Run Failed
    document.getElementById('btn-retry-run')?.addEventListener('click', () => {
      this.game.startRun();
    });
    
    document.getElementById('btn-failed-hub')?.addEventListener('click', () => {
      this.game.stateManager.changeState('HUB');
    });
    
    // Victory Screen (Legacy Phase 8)
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.game.startGame();
    });
    
    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.game.quitToMainMenu();
    });
    
    // Defeat Screen (Legacy Phase 8)
    document.getElementById('btn-try-again')?.addEventListener('click', () => {
      this.game.startGame();
    });
    
    document.getElementById('btn-defeat-menu')?.addEventListener('click', () => {
      this.game.quitToMainMenu();
    });
    
    // ESC key for pause
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.game.stateManager) {
        const state = this.game.stateManager.currentState;
        if (state === 'PLAYING' || state === 'BOSS_FIGHT') {
          this.game.pauseGame();
        } else if (state === 'PAUSED') {
          this.game.resumeGame();
        }
      }
    });
  }
  
  hideAll() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('howto-screen').style.display = 'none';
    document.getElementById('credits-screen').style.display = 'none';
    document.getElementById('hub-screen').style.display = 'none';
    document.getElementById('wave-transition').style.display = 'none';
    document.getElementById('level-transition').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';
    document.getElementById('defeat-screen').style.display = 'none';
    document.getElementById('run-success-screen').style.display = 'none';
    document.getElementById('run-failed-screen').style.display = 'none';
    
    // Unlock pointer so mouse is visible in menus
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
  
  showMainMenu() {
    this.hideAll();
    document.getElementById('main-menu').style.display = 'flex';
    this.hideHUD();
  }
  
  showHub() {
    this.hideAll();
    document.getElementById('hub-screen').style.display = 'flex';
    this.hideHUD();
    this.updateHubStats();
    this.updateUnlocksList();
  }
  
  updateHubStats() {
    if (this.game.persistentStats) {
      const stats = this.game.persistentStats.stats;
      document.getElementById('stat-runs').textContent = stats.runsAttempted;
      document.getElementById('stat-wins').textContent = stats.runsCompleted;
      document.getElementById('stat-bosses').textContent = stats.bossesDefeated;
      document.getElementById('stat-kills').textContent = stats.totalKills;
    }
  }
  
  updateUnlocksList() {
    const container = document.getElementById('unlocks-list');
    if (!container || !this.game.unlockManager) return;
    
    container.innerHTML = '';
    
    Object.entries(this.game.unlockManager.unlocks).forEach(([id, data]) => {
      const unlockDiv = document.createElement('div');
      unlockDiv.className = `unlock-item ${data.unlocked ? 'unlocked' : 'locked'}`;
      
      unlockDiv.innerHTML = `
        <div class="unlock-icon">${data.unlocked ? '✓' : '🔒'}</div>
        <div class="unlock-info">
          <h4>${data.name}</h4>
          <p>${data.description}</p>
        </div>
      `;
      
      container.appendChild(unlockDiv);
    });
  }
  
  showLevelTransition() {
    this.hideAll();
    document.getElementById('level-transition').style.display = 'flex';
    
    if (this.game.runManager && this.game.runManager.currentRun) {
      const level = this.game.runManager.currentRun.currentLevel;
      const config = this.game.runManager.getLevelConfig(level);
      
      if (config) {
        document.getElementById('reward-metal').textContent = `+ ${config.completionReward.metal} Metal`;
        document.getElementById('reward-energy').textContent = `+ ${config.completionReward.energy} Energy`;
        document.getElementById('next-level-text').textContent = 
          level < 3 ? `Proceeding to Level ${level + 1}...` : 'Preparing for Boss Fight...';
        
        // Animate countdown bar
        const fill = document.getElementById('level-countdown-fill');
        if (fill) {
          fill.style.width = '100%';
          setTimeout(() => {
            fill.style.transition = 'width 3s linear';
            fill.style.width = '0%';
          }, 100);
        }
      }
    }
  }
  
  showRunSuccessScreen() {
    this.hideAll();
    const stats = this.game.statsManager.getStats();
    
    // Show unlock if any
    if (this.game.unlockManager && this.game.unlockManager.lastUnlock) {
      const unlock = this.game.unlockManager.unlocks[this.game.unlockManager.lastUnlock];
      document.getElementById('unlock-name').textContent = unlock.name;
      document.getElementById('unlock-description').textContent = unlock.description;
      document.getElementById('new-unlock').style.display = 'block';
    } else {
      document.getElementById('new-unlock').style.display = 'none';
    }
    
    document.getElementById('success-kills').textContent = stats.enemiesKilled;
    document.getElementById('success-accuracy').textContent = this.game.statsManager.getAccuracy() + '%';
    document.getElementById('success-time').textContent = this.game.statsManager.getPlayTime();
    
    document.getElementById('run-success-screen').style.display = 'flex';
    this.hideHUD();
  }
  
  showRunFailedScreen() {
    this.hideAll();
    const stats = this.game.statsManager.getStats();
    const level = this.game.runManager.currentRun?.currentLevel || 0;
    
    document.getElementById('failed-level').textContent = `Level ${level}/3`;
    document.getElementById('failed-kills').textContent = stats.enemiesKilled;
    document.getElementById('failed-time').textContent = this.game.statsManager.getPlayTime();
    
    document.getElementById('run-failed-screen').style.display = 'flex';
    this.hideHUD();
  }
  
  showHowToPlay() {
    this.hideAll();
    document.getElementById('howto-screen').style.display = 'flex';
  }
  
  showCredits() {
    this.hideAll();
    document.getElementById('credits-screen').style.display = 'flex';
  }
  
  showWaveTransition(waveData) {
    this.hideAll();
    document.getElementById('wave-transition').style.display = 'flex';
    
    const config = this.game.waveManager.getWaveConfig(waveData.wave + 1);
    if (config) {
      document.getElementById('wave-title').textContent = config.label;
      document.getElementById('wave-enemies').textContent = 
        `${config.standard + config.shielded} Hostiles Detected`;
    }
  }
  
  showPauseMenu() {
    this.hideAll();
    document.getElementById('pause-menu').style.display = 'flex';
  }
  
  showVictoryScreen() {
    this.hideAll();
    const stats = this.game.statsManager.getStats();
    
    document.getElementById('victory-waves').textContent = '5/5';
    document.getElementById('victory-kills').textContent = stats.enemiesKilled;
    document.getElementById('victory-accuracy').textContent = this.game.statsManager.getAccuracy() + '%';
    document.getElementById('victory-resources').textContent = 
      `Metal: ${stats.resourcesCollected.metal}, Energy: ${stats.resourcesCollected.energy}`;
    document.getElementById('victory-ammo').textContent = this.game.statsManager.getFavoriteAmmo();
    document.getElementById('victory-time').textContent = this.game.statsManager.getPlayTime();
    
    document.getElementById('victory-screen').style.display = 'flex';
    this.hideHUD();
  }
  
  showDefeatScreen() {
    this.hideAll();
    const stats = this.game.statsManager.getStats();
    
    document.getElementById('defeat-waves').textContent = 
      `Wave ${this.game.waveManager.currentWave}/5`;
    document.getElementById('defeat-kills').textContent = stats.enemiesKilled;
    document.getElementById('defeat-accuracy').textContent = this.game.statsManager.getAccuracy() + '%';
    
    document.getElementById('defeat-screen').style.display = 'flex';
    this.hideHUD();
  }
  
  showHUD() {
    document.getElementById('health-display').style.display = 'block';
    document.getElementById('wave-display').style.display = 'block';
  }
  
  hideHUD() {
    document.getElementById('health-display').style.display = 'none';
    document.getElementById('wave-display').style.display = 'none';
  }
  
  updateCountdown(timeLeft) {
    const countdownText = document.getElementById('countdown-text');
    const countdownFill = document.getElementById('countdown-fill');
    
    if (countdownText) {
      countdownText.textContent = `Ready in: ${timeLeft}s`;
    }
    
    if (countdownFill) {
      const percent = (timeLeft / 5) * 100;
      countdownFill.style.width = `${percent}%`;
    }
  }
  
  setupHUDEventListeners() {
    // Listen for player health changes
    this.game.events.on('player:damaged', (data) => {
      const healthBar = document.getElementById('health-bar');
      const healthText = document.getElementById('health-text');
      
      if (healthBar && healthText) {
        const percent = (data.health / data.maxHealth) * 100;
        healthBar.style.width = `${percent}%`;
        
        // Color code health
        if (percent > 60) {
          healthBar.style.backgroundColor = '#00ff00'; // Green
        } else if (percent > 30) {
          healthBar.style.backgroundColor = '#ffcc00'; // Yellow
        } else {
          healthBar.style.backgroundColor = '#ff0000'; // Red
        }
        
        healthText.textContent = `${Math.round(data.health)}/${data.maxHealth}`;
      }
    });
    
    // Phase 9: Level-based updates
    this.game.events.on('level:started', (data) => {
      const waveNumber = document.getElementById('wave-number');
      const enemiesRemaining = document.getElementById('enemies-remaining');
      
      if (waveNumber) {
        waveNumber.textContent = `LEVEL ${data.level}/${data.total}`;
      }
      if (enemiesRemaining) {
        const totalEnemies = (data.config.enemies.standard || 0) + 
                            (data.config.enemies.shielded || 0) + 
                            (data.config.enemies.heavy || 0);
        enemiesRemaining.textContent = `${totalEnemies} ENEMIES`;
      }
    });
    
    this.game.events.on('level:enemy_killed', (data) => {
      const enemiesRemaining = document.getElementById('enemies-remaining');
      if (enemiesRemaining) {
        enemiesRemaining.textContent = `${data.remaining} ENEMIES`;
      }
    });
    
    // Legacy Phase 8: Wave updates
    this.game.events.on('wave:started', (data) => {
      const waveNumber = document.getElementById('wave-number');
      const enemiesRemaining = document.getElementById('enemies-remaining');
      
      if (waveNumber) {
        waveNumber.textContent = `WAVE ${data.wave}/${data.total}`;
      }
      if (enemiesRemaining) {
        enemiesRemaining.textContent = `${data.enemies} ENEMIES`;
      }
    });
    
    this.game.events.on('wave:enemy_killed', (data) => {
      const enemiesRemaining = document.getElementById('enemies-remaining');
      if (enemiesRemaining) {
        enemiesRemaining.textContent = `${data.remaining} ENEMIES`;
      }
    });
    
    this.game.events.on('wave:countdown', (data) => {
      this.updateCountdown(data.timeLeft);
    });
  }
}
