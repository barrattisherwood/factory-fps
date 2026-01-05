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
      // Only lock pointer when in PLAYING state and factory UI is not open
      if (this.game && this.game.stateManager && this.game.stateManager.isPlaying()) {
        // Don't lock if factory UI is open
        if (!this.game.factoryUI || !this.game.factoryUI.isOpen) {
          this.lock();
        }
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

    // ESC key to pause - prevent default to avoid pointer lock conflicts
    if (e.key === 'Escape') {
      e.preventDefault();
      if (this.game.stateManager && this.game.stateManager.isPlaying()) {
        // Exit pointer lock first
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        this.game.stateManager.changeState('PAUSED');
        return;
      }
    }

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
    const currentAmmo = this.game.ammoManager.currentType;

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

    let hitEnemy = null;
    let isWeakSpotHit = false;
    let closestDistance = Infinity;
    
    // FIRST: Check weak spots (for ALL ammo types)
    this.game.enemies.forEach(enemy => {
      if (enemy.weakSpot && enemy.weakSpot.worldPosition) {
        const distance = raycaster.ray.distanceToPoint(enemy.weakSpot.worldPosition);
        
        // If ray passes within weak spot radius
        if (distance < enemy.weakSpot.radius) {
          const distanceToEnemy = this.camera.position.distanceTo(enemy.weakSpot.worldPosition);
          if (distanceToEnemy < closestDistance) {
            hitEnemy = enemy;
            isWeakSpotHit = true;
            closestDistance = distanceToEnemy;
          }
        }
      }
    });
    
    // SECOND: If no weak spot hit, check body hits
    if (!hitEnemy) {
      const hits = raycaster.intersectObjects(this.game.enemies.map(e => e.getMesh()));
      if (hits.length > 0) {
        hitEnemy = this.game.enemies.find(e => e.getMesh() === hits[0].object);
        isWeakSpotHit = false;
      }
    }
    
    // Apply damage
    if (hitEnemy) {
      console.log('Hit enemy!' + (isWeakSpotHit ? ' CRITICAL!' : ''));
      
      // Check for shield tutorial trigger (kinetic hitting shielded enemy)
      if (!this.game.tutorialState.shownShieldTutorial && 
          currentAmmo === 'kinetic' && 
          hitEnemy.hasShield && 
          hitEnemy.config && 
          hitEnemy.config.name === 'Shielded Robot') {
        this.game.tutorialState.shownShieldTutorial = true;
        this.showShieldTutorial();
      }
      
      let damage = ammoConfig.damage;
      
      // Critical damage for weak spot hits (check if ammo type has multiplier)
      if (isWeakSpotHit) {
        const multiplierKey = currentAmmo + 'Multiplier';
        if (hitEnemy.weakSpot[multiplierKey]) {
          damage *= hitEnemy.weakSpot[multiplierKey];
          this.showCriticalHit(hitEnemy);
        }
      }
      
      // Emit hit event for stats tracking
      this.game.events.emit('enemy:hit', {
        enemy: hitEnemy,
        critical: isWeakSpotHit
      });
      
      // Debug hit point
      if (this.game.debug.enabled) {
        this.game.debug.drawPoint(isWeakSpotHit ? hitEnemy.weakSpot.worldPosition : hitEnemy.position, 0x00ff00, 0.3);
      }
      
      // Use ammo config damage
      hitEnemy.takeDamage(damage, ammoConfig.type, isWeakSpotHit);
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
  
  showCriticalHit(enemy) {
    // Screen shake
    const originalPos = this.camera.position.clone();
    this.camera.position.x += (Math.random() - 0.5) * 0.15;
    this.camera.position.y += (Math.random() - 0.5) * 0.15;
    
    setTimeout(() => {
      this.camera.position.copy(originalPos);
    }, 50);
    
    // Critical hit indicator
    const critDiv = document.createElement('div');
    critDiv.className = 'critical-hit-indicator';
    critDiv.textContent = 'CRITICAL!';
    
    const screenPos = this.getScreenPosition(enemy.position);
    critDiv.style.left = screenPos.x + 'px';
    critDiv.style.top = (screenPos.y - 60) + 'px';
    
    document.body.appendChild(critDiv);
    
    // Animate and remove
    let offsetY = 0;
    let opacity = 1;
    const interval = setInterval(() => {
      offsetY -= 3;
      opacity -= 0.05;
      critDiv.style.top = (screenPos.y - 60 + offsetY) + 'px';
      critDiv.style.opacity = opacity;
      
      if (opacity <= 0) {
        critDiv.remove();
        clearInterval(interval);
      }
    }, 30);
    
    // Flash weak spot bright
    if (enemy.weakSpotMesh) {
      const originalIntensity = enemy.weakSpotMesh.material.emissiveIntensity;
      enemy.weakSpotMesh.material.emissiveIntensity = 3.0;
      setTimeout(() => {
        if (enemy.weakSpotMesh) {
          enemy.weakSpotMesh.material.emissiveIntensity = originalIntensity;
        }
      }, 100);
    }
  }
  
  getScreenPosition(worldPos) {
    const vector = worldPos.clone().project(this.camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
    return { x, y };
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
  
  showShieldTutorial() {
    // Show notification instead of blocking modal
    if (this.game.notificationManager) {
      this.game.notificationManager.show(
        '⚡ SHIELD DETECTED! Kinetic rounds are INEFFECTIVE against shields. Press [2] for ENERGY AMMO (4X damage to shields)!',
        'warning',
        6000
      );
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

  resetPosition(position = null, facing = null, callback = null) {
    // Unlock pointer first to ensure clean state
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    
    // Default spawn position and direction
    const spawnPos = position || new THREE.Vector3(0, this.eyeHeight, 0);
    const spawnFacing = facing !== null ? facing : 0; // 0 = forward (+Z), Math.PI = backward (-Z)
    
    // Reset velocity first
    this.velocity.set(0, 0, 0);
    
    // PointerLockControls wraps the camera - only set position on controls object
    if (this.controls && this.controls.getObject) {
      const controlsObject = this.controls.getObject();
      
      // Set position (controls object, NOT camera)
      controlsObject.position.copy(spawnPos);
      
      // Reset camera's LOCAL position to zero (it's a child of controls object)
      this.camera.position.set(0, 0, 0);
      
      // Reset rotation using euler
      this.controls.euler.x = 0; // Pitch
      this.controls.euler.y = spawnFacing; // Yaw
      this.controls.euler.z = 0; // Roll
    } else {
      // Fallback if controls not initialized
      this.camera.position.copy(spawnPos);
      this.camera.rotation.set(0, spawnFacing, 0);
    }
    
    // Reset grounded state
    this.isGrounded = true;
    this.canJump = true;
    this.spacePressed = false;
    
    console.log(`Player reset to position: ${spawnPos.toArray()}, facing: ${spawnFacing.toFixed(2)} rad`);
    
    // Execute callback if provided
    if (callback && typeof callback === 'function') {
      callback();
    }
  }
  
  logPosition() {
    const controlsObj = this.controls.getObject();
    console.log('Controls Object Position:', controlsObj.position.toArray());
    console.log('Camera Position:', this.camera.position.toArray());
    console.log('Camera Rotation:', this.camera.rotation.toArray());
    console.log('Controls Euler:', [this.controls.euler.x, this.controls.euler.y, this.controls.euler.z]);
  }
  
  getHealthPercent() {
    return (this.currentHealth / this.maxHealth) * 100;
  }

  getGroup() {
    return new THREE.Group(); // Empty group, camera is controlled differently
  }
}
