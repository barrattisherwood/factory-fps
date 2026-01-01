import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { ObjectPool } from './core/ObjectPool.js';

export class Player {
  constructor(camera, game) {
    this.camera = camera;
    this.game = game;
    this.moveSpeed = 0.1;
    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.isGrounded = false;
    this.gravity = 0.01;
    this.jumpForce = 0.5;
    this.eyeHeight = 1.7; // Player eye height above ground
    this.canJump = true; // Can only jump once per ground contact
    this.spacePressed = false; // Track if space was pressed last frame
    
    // Health system
    this.maxHealth = 100;
    this.currentHealth = 100;
    this.isInvulnerable = false;
    this.invulnerabilityTime = 1.0; // 1 second

    // Setup bullet tracer pool (performance optimization)
    this.bulletPool = new ObjectPool(
      // Create function
      () => {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
          transparent: true,
          opacity: 0.6,
          linewidth: 2
        });
        const line = new THREE.Line(geometry, material);
        line.visible = false;
        return line;
      },
      // Reset function
      (line) => {
        line.visible = false;
        if (this.game.scene.children.includes(line)) {
          this.game.scene.remove(line);
        }
      },
      50 // Pre-create 50 bullet tracers
    );

    // Setup pointer lock controls
    this.controls = new PointerLockControls(camera, document.body);
    this.isLocked = false;

    // Event listeners
    document.addEventListener('click', () => {
      // Only lock pointer when in PLAYING state (not in menus)
      if (this.game && this.game.stateManager && this.game.stateManager.currentState === 'PLAYING') {
        this.lock();
      }
    });
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));

    this.setupGun();
  }

  setupGun() {
    // Create gun group and parent it directly to camera
    this.gunGroup = new THREE.Group();
    
    // Gun body - dark metallic material
    const gunGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.3);
    const gunMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,  // Dark gunmetal
      metalness: 0.8,
      roughness: 0.3
    });
    const gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);
    this.gunGroup.add(gunMesh);

    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 16);
    const barrelMesh = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrelMesh.position.z = -0.2;
    barrelMesh.rotation.x = Math.PI / 2;
    this.gunGroup.add(barrelMesh);

    // Muzzle light
    this.muzzleLight = new THREE.PointLight(0xff6600, 0, 40);
    this.muzzleLight.position.z = -0.35;
    this.gunGroup.add(this.muzzleLight);

    // Muzzle flash
    const flashGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
    });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeometry, flashMaterial);
    this.muzzleFlashMesh.position.z = -0.35;
    this.gunGroup.add(this.muzzleFlashMesh);
    
    // Position gun in bottom-right of screen, similar to reference implementation
    this.gunGroup.position.set(0.15, -0.12, -0.3);
    
    // Add gun to camera so it follows view perfectly
    this.camera.add(this.gunGroup);
  }

  lock() {
    if (!this.isLocked) {
      this.controls.lock();
    }
  }

  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === document.body;
  }

  onKeyDown(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Ammo switching controls
    if (key === '1') {
      this.game.ammoManager.switchType('kinetic');
    } else if (key === '2') {
      this.game.ammoManager.switchType('flux');
    } else if (key === '3') {
      // Phase 9: Thermal ammo (requires unlock)
      if (this.game.ammoManager.isUnlocked('thermal')) {
        this.game.ammoManager.switchType('thermal');
      } else {
        console.log('Thermal ammo not unlocked yet');
      }
    }
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  onMouseDown(e) {
    if (e.button === 0 && this.isLocked) { // Left click
      this.shoot();
    }
  }

  shoot() {
    // Prevent shooting while factory overlay is open
    if (this.game.factoryUI && this.game.factoryUI.isOpen) {
      return;
    }

    // Check ammo via AmmoManager
    if (!this.game.ammoManager.hasAmmo()) {
      console.log('No ammo!');
      return;
    }

    // Consume ammo through manager (emits event automatically)
    if (!this.game.ammoManager.consume()) {
      return;
    }

    // Get current ammo config for visual effects
    const ammoConfig = this.game.ammoManager.getCurrentConfig();

    // Muzzle flash
    this.createMuzzleFlash(ammoConfig);

    // Raycast for hit detection
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    raycaster.set(this.camera.position, direction);

    // Debug visualization
    if (this.game.debug.enabled) {
      this.game.debug.drawRay(this.camera.position, direction, 100, ammoConfig.color);
    }

    const hits = raycaster.intersectObjects(this.game.enemies.map(e => e.getMesh()));
    if (hits.length > 0) {
      const hitEnemy = this.game.enemies.find(e => e.getMesh() === hits[0].object);
      if (hitEnemy) {
        console.log('Hit enemy!');
        
        // Emit hit event for stats tracking
        this.game.events.emit('enemy:hit', {
          enemy: hitEnemy,
          position: hits[0].point
        });
        
        // Debug hit point
        if (this.game.debug.enabled) {
          this.game.debug.drawPoint(hits[0].point, 0x00ff00, 0.3);
        }
        
        // Use ammo config damage
        hitEnemy.takeDamage(ammoConfig.damage, ammoConfig.type);
      }
    }

    // Create bullet tracer line using object pool
    this.createBulletTracer(this.camera.position, direction, ammoConfig);
    
    // Emit weapon fired event
    this.game.events.emit('weapon:fired', {
      type: ammoConfig.type,
      damage: ammoConfig.damage,
      position: this.camera.position.clone()
    });
  }

  createMuzzleFlash(ammoConfig) {
    // Flash at barrel with config colors
    this.muzzleLight.intensity = ammoConfig.flashIntensity;
    this.muzzleLight.color.setHex(ammoConfig.color);
    this.muzzleFlashMesh.material.opacity = 0.8;
    this.muzzleFlashMesh.material.color.setHex(ammoConfig.glowColor);

    setTimeout(() => {
      this.muzzleLight.intensity = 0;
      this.muzzleFlashMesh.material.opacity = 0;
    }, ammoConfig.flashDuration);
  }

  createBulletTracer(origin, direction, ammoConfig) {
    const distance = 100;
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(distance));

    // Get bullet from pool
    const line = this.bulletPool.get();
    const points = [origin.clone(), endPoint];
    line.geometry.setFromPoints(points);
    line.material.color.setHex(ammoConfig.trailColor);
    line.visible = true;

    this.game.scene.add(line);

    // Return to pool after a short duration
    setTimeout(() => {
      this.bulletPool.release(line);
    }, 100);
  }

  update(timeScale = 1.0) {
    if (!this.isLocked) return;

    // Gun is parented to camera, no manual update needed!

    // Movement - only on horizontal plane, ignore camera vertical tilt
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

    // Zero out Y component to prevent camera tilt from affecting vertical velocity
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    this.velocity.x = 0;
    this.velocity.z = 0;

    // Scale movement by timeScale so opening factory slows player
    const scaledMove = this.moveSpeed * timeScale;
    if (this.keys['w']) this.velocity.add(forward.multiplyScalar(scaledMove));
    if (this.keys['s']) this.velocity.sub(forward.multiplyScalar(scaledMove));
    if (this.keys['a']) this.velocity.sub(right.multiplyScalar(scaledMove));
    if (this.keys['d']) this.velocity.add(right.multiplyScalar(scaledMove));

    // Check if on ground
    if (this.camera.position.y <= this.eyeHeight) {
      this.camera.position.y = this.eyeHeight;
      this.isGrounded = true;
      this.canJump = true;
      
      // Stop downward velocity when on ground
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    } else {
      this.isGrounded = false;
    }

    // Jump - only on key press transition (not held)
    const spaceDown = this.keys[' '];
    if (spaceDown && !this.spacePressed && this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
    this.spacePressed = spaceDown;

    // Apply gravity (scaled)
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * timeScale;
    }

    // Apply velocity scaled to frame (timeScale affects per-frame movement)
    this.camera.position.add(this.velocity);
  }
  
  takeDamage(amount) {
    if (this.isInvulnerable || this.currentHealth <= 0) return;
    
    this.currentHealth -= amount;
    this.currentHealth = Math.max(0, this.currentHealth);
    
    this.game.events.emit('player:damaged', { 
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      amount: amount
    });
    
    // Track stats
    if (this.game.statsManager) {
      this.game.statsManager.onDamageTaken(amount);
    }
    
    // Visual feedback
    this.flashDamage();
    
    // Play damage sound
    if (this.game.soundManager) {
      this.game.soundManager.playDamage();
    }
    
    // Brief invulnerability
    this.makeInvulnerable();
    
    if (this.currentHealth <= 0) {
      this.die();
    }
  }
  
  makeInvulnerable() {
    this.isInvulnerable = true;
    setTimeout(() => {
      this.isInvulnerable = false;
    }, this.invulnerabilityTime * 1000);
  }
  
  flashDamage() {
    // Screen flash red
    const damageFlash = document.getElementById('damage-flash');
    if (damageFlash) {
      damageFlash.style.opacity = '0.3';
      setTimeout(() => {
        damageFlash.style.opacity = '0';
      }, 200);
    }
  }
  
  die() {
    console.log('Player died!');
    this.game.events.emit('player:died');
  }
  
  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.game.events.emit('player:damaged', { 
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      amount: -amount
    });
  }
  
  resetHealth() {
    this.currentHealth = this.maxHealth;
    this.isInvulnerable = false;
  }
  
  getHealthPercent() {
    return (this.currentHealth / this.maxHealth) * 100;
  }

  getGroup() {
    return new THREE.Group(); // Empty group, camera is controlled differently
  }
}
