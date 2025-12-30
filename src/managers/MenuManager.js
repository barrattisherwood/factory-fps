/**
 * MenuManager - Handles all menu screens and UI interactions
 */
export class MenuManager {
  constructor(game) {
    this.game = game;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Main Menu
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.game.soundManager.init(); // Initialize audio on user interaction
      this.game.startGame();
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
    
    // Pause Menu
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.game.resumeGame();
    });
    
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.game.restartGame();
    });
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
      this.game.quitToMainMenu();
    });
    
    // Victory Screen
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.game.startGame();
    });
    
    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.game.quitToMainMenu();
    });
    
    // Defeat Screen
    document.getElementById('btn-try-again')?.addEventListener('click', () => {
      this.game.startGame();
    });
    
    document.getElementById('btn-defeat-menu')?.addEventListener('click', () => {
      this.game.quitToMainMenu();
    });
    
    // ESC key for pause
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.game.stateManager) {
        if (this.game.stateManager.currentState === 'PLAYING') {
          this.game.pauseGame();
        } else if (this.game.stateManager.currentState === 'PAUSED') {
          this.game.resumeGame();
        }
      }
    });
  }
  
  hideAll() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('howto-screen').style.display = 'none';
    document.getElementById('credits-screen').style.display = 'none';
    document.getElementById('wave-transition').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';
    document.getElementById('defeat-screen').style.display = 'none';
  }
  
  showMainMenu() {
    this.hideAll();
    document.getElementById('main-menu').style.display = 'flex';
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
    
    // Listen for wave updates
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
