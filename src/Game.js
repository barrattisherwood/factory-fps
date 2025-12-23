import * as THREE from 'three';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { UI } from './UI.js';
import { EventBus } from './core/EventBus.js';
import { ResourceManager } from './managers/ResourceManager.js';
import { AmmoManager } from './managers/AmmoManager.js';
import { DebugRenderer } from './utils/DebugRenderer.js';

export class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.player = null;
    this.enemies = [];
    this.orbs = [];
    this.gameState = 'playing'; // 'playing' or 'victory'

    // Initialize core systems
    this.events = new EventBus();
    this.resourceManager = new ResourceManager(this.events);
    this.ammoManager = new AmmoManager(this.events);
    this.debug = new DebugRenderer(this.scene);

    this.setup();
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

    // Spawn enemies
    this.spawnEnemies();
  }

  spawnEnemies() {
    const enemyCount = 4;
    const spawnRadius = 30;

    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const x = Math.cos(angle) * spawnRadius;
      const z = Math.sin(angle) * spawnRadius;

      const enemy = new Enemy(x, 1.5, z);
      
      // Set death callback
      enemy.onDeath = (orb) => {
        this.addOrb(orb);
        this.removeEnemy(enemy);
      };

      this.enemies.push(enemy);
      this.scene.add(enemy.getMesh());
    }

    console.log(`Spawned ${enemyCount} enemies`);
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
    
    // Emit event for quest system, achievements, etc.
    this.events.emit('enemy:killed', {
      type: enemy.type || 'standard',
      position: enemy.position
    });
    
    this.checkVictoryCondition();
  }

  checkVictoryCondition() {
    if (this.enemies.length === 0 && this.gameState === 'playing') {
      this.gameState = 'victory';
      this.ui.showVictory();
      console.log('SECTOR CLEARED!');
    }
  }

  update() {
    if (this.player) {
      this.player.update();
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update();
    });

    // Update orbs
    this.orbs.forEach(orb => {
      orb.update(this.player.camera.getWorldPosition(new THREE.Vector3()));
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
        
        if (distance < 2) {
          // Add ammo based on orb type
          const ammoType = orb.ammoType || 'kinetic';
          const ammoAmount = orb.ammoAmount || 10;
          this.ammoManager.add(ammoType, ammoAmount);
          
          orb.collect();
          this.removeOrb(orb);
        }
      }
    }
  }

  restart() {
    location.reload();
  }
}
