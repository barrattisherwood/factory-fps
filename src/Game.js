import * as THREE from 'three';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Boss } from './Boss.js';
import { UI } from './UI.js';
import { EventBus } from './core/EventBus.js';
import { ResourceManager } from './managers/ResourceManager.js';
import { AmmoManager } from './managers/AmmoManager.js';
import { FactoryUI } from './FactoryUI.js';
import { DebugRenderer } from './utils/DebugRenderer.js';
import { GameStateManager } from './managers/GameStateManager.js';
import { WaveManager } from './managers/WaveManager.js';
import { StatsManager } from './managers/StatsManager.js';
import { SoundManager } from './managers/SoundManager.js';
import { MenuManager } from './managers/MenuManager.js';
import { RunManager } from './managers/RunManager.js';
import { UnlockManager } from './managers/UnlockManager.js';
import { PersistentStats } from './managers/PersistentStats.js';

export class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.player = null;
    this.enemies = [];
    this.orbs = [];
    this.boss = null;
    this.timeScale = 1.0; // Global time scale (1.0 = normal)

    // Initialize core systems
    this.events = new EventBus();
    this.resourceManager = new ResourceManager(this.events);
    this.ammoManager = new AmmoManager(this.events);
    // Link resource manager to ammo manager for auto-production
    this.resourceManager.setAmmoManager(this.ammoManager);
    this.debug = new DebugRenderer(this.scene);
    
    // Phase 8: Manager systems
    this.stateManager = new GameStateManager(this);
    this.waveManager = new WaveManager(this);
    this.statsManager = new StatsManager();
    this.soundManager = new SoundManager();
    this.menuManager = new MenuManager(this);
    
    // Phase 9: Roguelike systems
    this.runManager = new RunManager(this);
    this.unlockManager = new UnlockManager(this.events);
    this.persistentStats = new PersistentStats();
    
    // Phase 9: Wire unlock manager to resource manager
    this.resourceManager.setUnlockManager(this.unlockManager);
    
    // Expose game globally for boss/unlock access
    window.game = this;

    this.setup();
    this.setupEventListeners();
    
    // Start in main menu
    this.stateManager.changeState('MAIN_MENU');
  }

  setup() {
    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add grid helper for visual reference
    const gridHelper = new THREE.GridHelper(200, 50, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // Create player
    this.player = new Player(this.camera, this);
    this.scene.add(this.player.getGroup());

    // Create UI (pass eventBus for listening to events)
    this.ui = new UI(this.events);

    // Create factory UI overlay
    this.factoryUI = new FactoryUI(this.events, this);
    
    // Setup HUD event listeners
    this.menuManager.setupHUDEventListeners();
  }
  
  setupEventListeners() {
    // Enemy killed tracking
    this.events.on('enemy:killed', (data) => {
      this.statsManager.onEnemyKilled(data.type);
      this.persistentStats.onEnemyKilled();
      
      // Phase 9: Use RunManager for level-based gameplay
      if (this.runManager.currentRun) {
        this.runManager.onEnemyKilled();
      } else {
        // Legacy Phase 8: Wave-based
        this.waveManager.onEnemyKilled();
      }
      
      this.soundManager.playHit();
    });
    
    // Player death
    this.events.on('player:died', () => {
      this.statsManager.finalize();
      
      // Phase 9: Run failed
      if (this.runManager.currentRun) {
        this.runManager.onRunFailed();
      } else {
        // Legacy Phase 8
        this.stateManager.changeState('DEFEAT');
      }
    });
    
    // Resource collection tracking
    this.events.on('resource:changed', (data) => {
      if (data.amount > 0) {
        this.statsManager.onResourceCollected(data.type, data.amount);
        this.soundManager.playCollect();
      }
    });
    
    // Weapon fired tracking
    this.events.on('weapon:fired', (data) => {
      this.statsManager.onShotFired(data.type);
      this.soundManager.playShoot(data.type);
    });
    
    // Shot hit tracking
    this.events.on('enemy:hit', () => {
      this.statsManager.onShotHit();
    });
    
    // Phase 9: Run events
    this.events.on('run:started', (data) => {
      this.persistentStats.onRunStarted();
      console.log(`Run #${data.runId} started`);
    });
    
    this.events.on('run:success', (data) => {
      const runTime = data.endTime - data.startTime;
      this.persistentStats.onRunCompleted(runTime);
      console.log('Run completed successfully!');
    });
    
    this.events.on('boss:defeated', (data) => {
      this.persistentStats.onBossDefeated();
      console.log(`Boss defeated: ${data.name}`);
      
      // Run success after boss
      setTimeout(() => {
        this.runManager.onRunSuccess();
      }, 2000);
    });
    
    // Phase 9: Unlock events
    this.events.on('unlock:acquired', (unlockId) => {
      console.log(`Unlock acquired: ${unlockId}`);
      
      // Unlock thermal ammo when thermal blueprint is acquired
      if (unlockId === 'thermal_panel_blueprint') {
        this.ammoManager.unlockAmmoType('thermal');
        console.log('Thermal ammo unlocked! Press 3 to switch.');
      }
    });
    
    // Legacy Phase 8: Wave events
    this.events.on('wave:started', (data) => {
      this.soundManager.playWaveStart();
      console.log(`Wave ${data.wave} started: ${data.label}`);
    });
    
    this.events.on('wave:completed', (data) => {
      this.statsManager.onWaveCompleted(data.wave);
      console.log(`Wave ${data.wave} completed!`);
    });
  }

  setTimeScale(value) {
    this.timeScale = value;
  }
  
  // Game state transition methods
  startGame() {
    console.log('Starting new game...');
    
    // Reset all systems
    this.statsManager.reset();
    this.waveManager.reset();
    this.player.resetHealth();
    this.clearEnemies();
    this.clearOrbs();
    
    // Reset resources and ammo
    this.resourceManager.reset();
    this.ammoManager.reset();
    
    // Show HUD
    this.menuManager.showHUD();
    
    // Start first wave
    this.stateManager.changeState('PLAYING');
    this.waveManager.startNextWave();
  }
  
  pauseGame() {
    if (this.stateManager.currentState === 'PLAYING') {
      this.stateManager.changeState('PAUSED');
    }
  }
  
  resumeGame() {
    if (this.stateManager.currentState === 'PAUSED') {
      this.stateManager.changeState('PLAYING');
    }
  }
  
  restartGame() {
    this.startGame();
  }
  
  quitToMainMenu() {
    this.clearEnemies();
    this.clearOrbs();
    this.stateManager.changeState('MAIN_MENU');
  }

  // State manager callback methods
  showMainMenu() {
    this.menuManager.showMainMenu();
  }
  
  showHub() {
    this.clearEnemies();
    this.clearOrbs();
    this.menuManager.showHub();
  }
  
  hideAllMenus() {
    this.menuManager.hideAll();
    this.menuManager.showHUD();
  }
  
  showLevelTransition() {
    const level = this.runManager.currentLevel;
    const levelData = this.runManager.LEVEL_CONFIG[level];
    this.menuManager.showLevelTransition({
      level: level,
      title: levelData.title,
      description: levelData.description,
      enemyCount: levelData.enemyCount
    });
  }
  
  showWaveTransition() {
    this.menuManager.showWaveTransition({
      wave: this.waveManager.currentWave
    });
  }
  
  showPauseMenu() {
    this.menuManager.showPauseMenu();
  }
  
  showRunSuccessScreen() {
    this.menuManager.showRunSuccessScreen();
  }
  
  showRunFailedScreen() {
    this.menuManager.showRunFailedScreen();
  }
  
  showVictoryScreen() {
    this.menuManager.showVictoryScreen();
  }
  
  showDefeatScreen() {
    this.menuManager.showDefeatScreen();
  }
  
  pauseTime() {
    this.setTimeScale(0);
  }
  
  resumeTime() {
    this.setTimeScale(1.0);
  }

  // Enemy spawning and management
  spawnEnemy(type, position) {
    const enemy = new Enemy(position.x, position.y, position.z, type);
    
    // Set death callback
    enemy.onDeath = (orbs) => {
      orbs.forEach(orb => this.addOrb(orb));
      this.removeEnemy(enemy);
    };

    this.enemies.push(enemy);
    this.scene.add(enemy.getMesh());
  }
  
  clearEnemies() {
    this.enemies.forEach(enemy => {
      this.scene.remove(enemy.getMesh());
    });
    this.enemies = [];
  }
  
  clearOrbs() {
    this.orbs.forEach(orb => {
      this.scene.remove(orb.getMesh());
    });
    this.orbs = [];
  }

  addOrb(orb) {
    this.orbs.push(orb);
    this.scene.add(orb.getMesh());
  }

  removeOrb(orb) {
    const index = this.orbs.indexOf(orb);
    if (index > -1) {
      this.orbs.splice(index, 1);
      this.scene.remove(orb.getMesh());
    }
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
      this.scene.remove(enemy.getMesh());
    }
    
    // Emit event for tracking
    this.events.emit('enemy:killed', {
      type: enemy.type || 'standard',
      position: enemy.position
    });
  }

  update() {
    // Only update gameplay when playing
    if (this.stateManager && !this.stateManager.isPlaying()) {
      return;
    }
    
    if (this.player) {
      this.player.update(this.timeScale);
    }

    // Update enemies (including boss if present)
    this.enemies.forEach(enemy => {
      if (enemy.update) {
        enemy.update(this.timeScale);
      }
      // Check player collision
      if (enemy.checkPlayerCollision) {
        enemy.checkPlayerCollision(this.player);
      }
    });

    // Update orbs
    this.orbs.forEach(orb => {
      orb.update(this.player.camera.getWorldPosition(new THREE.Vector3()), this.timeScale);
    });

    // Check for orb collection
    if (this.player) {
      const playerPos = this.player.camera.getWorldPosition(new THREE.Vector3());
      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const orb = this.orbs[i];
        const distance = playerPos.distanceTo(orb.getMesh().position);
        
        // Debug visualization
        if (this.debug.enabled) {
          this.debug.drawSphere(orb.getMesh().position, 2, 0x00ffff);
        }
        
        if (distance < 3) {  // Increased from 2 for easier collection
          // Add ammo based on orb type
          const ammoType = orb.ammoType || 'kinetic';
          const ammoAmount = orb.ammoAmount || 10;
          
          console.log(`Collecting orb: ${orb.resourceType} → ${ammoType} (+${ammoAmount})`);
          // Route collection through ResourceManager so factory receives it
          this.resourceManager.collectResource(orb.resourceType, ammoAmount);

          orb.collect();
          this.removeOrb(orb);
        }
      }
    }
    
    // Phase 9: Check if level complete (all enemies dead)
    if (this.runManager.currentRun && this.stateManager.currentState === 'PLAYING') {
      if (this.enemies.length === 0) {
        this.runManager.onLevelComplete();
      }
    }
  }

  restart() {
    location.reload();
  }
  
  // === Phase 9: Roguelike Run Methods ===
  
  startRun() {
    // Reset player and systems
    this.player.resetHealth();
    this.clearEnemies();
    this.clearOrbs();
    
    // Reset resources and ammo
    this.resourceManager.reset();
    this.ammoManager.reset();
    
    // Reset stats for new run
    this.statsManager.reset();
    
    // Start new run
    this.runManager.startNewRun();
    
    // Show HUD and change state
    this.menuManager.showHUD();
    this.stateManager.changeState('PLAYING');
    
    // Spawn first level
    this.runManager.spawnCurrentLevel();
  }
  
  loadBossFight() {
    // Clear any remaining enemies
    this.clearEnemies();
    
    // Show level transition first
    this.menuManager.showLevelTransition({
      level: 'BOSS',
      title: 'BOSS ENCOUNTER',
      description: 'The Flux Warden awaits...',
      enemyCount: 1
    });
    
    // Wait for transition, then spawn boss
    setTimeout(() => {
      const bossSpawnPos = { x: 0, y: 1, z: -50 };
      this.boss = new Boss(bossSpawnPos.x, bossSpawnPos.y, bossSpawnPos.z, 'flux_warden');
      
      // Set death callback
      this.boss.onDeath = (orbs) => {
        orbs.forEach(orb => this.addOrb(orb));
        
        // Drop unlock
        this.boss.dropUnlock();
        
        // Remove boss
        this.scene.remove(this.boss.getMesh());
        this.boss = null;
        
        // Emit boss defeated
        this.events.emit('boss:defeated', { name: 'Flux Warden' });
      };
      
      this.enemies.push(this.boss);
      this.scene.add(this.boss.getMesh());
      
      // Change state to boss fight
      this.stateManager.changeState('BOSS_FIGHT');
      this.menuManager.hideAll();
      this.menuManager.showHUD();
    }, 3000);
  }
  
  quitToHub() {
    this.clearEnemies();
    this.clearOrbs();
    
    // Reset run
    this.runManager.currentRun = null;
    
    this.stateManager.changeState('HUB');
  }
  
  restartRun() {
    this.startRun();
  }
  
  resetProgress() {
    // Confirm with user first
    if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
      this.unlockManager.reset();
      this.persistentStats.reset();
      alert('Progress reset complete. Starting fresh!');
      this.stateManager.changeState('HUB');
    }
  }
}
