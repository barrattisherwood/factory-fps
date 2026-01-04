import * as THREE from 'three';
import { ResourceOrb } from './ResourceOrb.js';
import { getEnemyConfig } from './config/enemies.js';

export class Enemy {
  constructor(x, y, z, type = 'standard', levelNumber = 1) {
    this.position = new THREE.Vector3(x, y, z);
    this.type = type;
    this.config = getEnemyConfig(type);
    this.levelNumber = levelNumber;
    
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.isDead = false;
    this.flashTimer = 0;
    this.flashDuration = 0;
    this.targetColor = null;
    this.originalColor = new THREE.Color(this.config.color);
    this.onDeath = null; // Callback for when enemy dies
    
    // Shield system
    this.hasShield = this.config.hasShield || false;
    this.shieldHp = this.hasShield ? 100 : 0; // Shield takes 100 damage to break
    this.maxShieldHp = this.shieldHp;
    this.shieldBroken = false;
    
    // Movement properties
    this.velocity = new THREE.Vector3();
    this.speed = this.config.speed || 1.5;
    this.chaseRange = 30; // Start chasing when player within 30 units
    this.attackRange = 2.5; // Deal damage when within 2.5 units
    this.isChasing = false;
    this.lastAttackTime = 0;
    
    // Setup AI behavior based on level
    this.setupAIBehavior();

    this.createMesh();
  }
  
  setupAIBehavior() {
    // Level 1: Tutorial mode (stationary)
    if (this.levelNumber === 1) {
      this.aiMode = 'stationary';
      this.speed = 0; // Don't move
    }
    // Level 2: Gentle introduction to movement
    else if (this.levelNumber === 2) {
      this.aiMode = 'slow_chase';
      this.speed = this.config.speed * 0.5; // 50% speed
    }
    // Level 3+: Full aggression
    else {
      this.aiMode = 'full_chase';
      this.speed = this.config.speed; // Normal speed
    }
  }

  createMesh() {
    // Create enemy geometry from config
    const size = this.config.size;
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      metalness: this.config.metalness,
      roughness: this.config.roughness,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add glowing core from config
    const coreGeometry = new THREE.SphereGeometry(this.config.coreSize, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: this.config.coreColor,
      emissive: this.config.coreEmissive,
      emissiveIntensity: 0.5,
    });
    this.core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.core.position.z = 0;
    this.mesh.add(this.core);

    // Add shield visual if shielded enemy
    if (this.config.hasShield) {
      this.createShieldVisual();
    }
    
    // Add weak spot visual if configured
    if (this.config.weakSpot) {
      this.createWeakSpotVisual(this.config.weakSpot);
    }
  }
  
  createWeakSpotVisual(spotConfig) {
    console.log('Creating weak spot for', this.config.name);
    
    // Use MeshBasicMaterial for guaranteed visibility (no lighting required)
    const geometry = new THREE.SphereGeometry(spotConfig.radius * 1.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: spotConfig.visualColor,
      transparent: false,
      side: THREE.DoubleSide
    });
    
    this.weakSpotMesh = new THREE.Mesh(geometry, material);
    this.weakSpotMesh.position.set(
      spotConfig.position.x,
      spotConfig.position.y,
      spotConfig.position.z
    );
    
    // Disable raycasting on visual mesh (we do manual sphere checks)
    this.weakSpotMesh.raycast = () => {};
    
    // Pulsing animation data
    this.weakSpotMesh.userData.pulseTime = Math.random() * Math.PI * 2;
    this.weakSpotMesh.userData.pulseSpeed = 3.0;
    this.weakSpotMesh.userData.baseColor = new THREE.Color(spotConfig.visualColor);
    
    // Add to enemy mesh
    this.mesh.add(this.weakSpotMesh);
    
    // Verify it was added
    console.log('Weak spot added:', this.weakSpotMesh);
    console.log('Enemy mesh children count:', this.mesh.children.length);
    
    // Store for hit detection
    this.weakSpot = {
      ...spotConfig,
      worldPosition: new THREE.Vector3()
    };
  }

  createShieldVisual() {
    // Create blue wireframe sphere around enemy as shield
    const shieldGeometry = new THREE.IcosahedronGeometry(2.2, 4);
    const shieldMaterial = new THREE.MeshPhongMaterial({
      color: this.config.shieldColor,
      emissive: this.config.shieldEmissive,
      emissiveIntensity: this.config.shieldIntensity,
      wireframe: false,
      transparent: true,
      opacity: 0.3,
    });
    this.shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    this.shield.position.set(0, 0, 0); // Position relative to parent
    
    // Disable raycasting on shield so bullets hit the enemy mesh behind it
    this.shield.raycast = () => {};
    
    this.mesh.add(this.shield);

    // Add wireframe overlay for dramatic effect
    this.shieldWireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(shieldGeometry),
      new THREE.LineBasicMaterial({
        color: this.config.shieldColor,
        transparent: true,
        opacity: 0.8,
        linewidth: 1
      })
    );
    
    // Disable raycasting on wireframe too
    this.shieldWireframe.raycast = () => {};
    
    this.mesh.add(this.shieldWireframe);
  }

  takeDamage(amount, damageType = 'kinetic', isCritical = false) {
    if (this.isDead) return;

    // If shield is active, handle shield damage
    if (this.hasShield && !this.shieldBroken) {
      if (damageType === 'flux') {
        // Flux damages shields effectively
        this.shieldHp -= amount;
        this.showDamageFlash(true);
        this.showDamageNumber(amount, true);
        
        // Update shield opacity based on HP
        if (this.shield) {
          const shieldPercent = this.shieldHp / this.maxShieldHp;
          this.shield.material.opacity = 0.3 * shieldPercent;
          this.shield.material.emissiveIntensity = this.config.shieldIntensity * shieldPercent;
        }
        
        console.log(`Shield HP: ${Math.round(this.shieldHp)}/${this.maxShieldHp}`);
        
        if (this.shieldHp <= 0) {
          this.breakShield();
        }
        return;
      } else {
        // Kinetic barely scratches shields
        const shieldDamage = amount * 0.1; // Only 10% damage to shields
        this.shieldHp -= shieldDamage;
        this.showDamageFlash(false);
        this.showDamageNumber(shieldDamage, false);
        console.log(`Shield HP: ${Math.round(this.shieldHp)}/${this.maxShieldHp} (kinetic ineffective)`);
        
        if (this.shieldHp <= 0) {
          this.breakShield();
        }
        return;
      }
    }

    // Shield is broken or doesn't exist - damage the enemy directly
    // Now it's a standard enemy: kinetic effective, flux less effective
    let weakness;
    if (this.shieldBroken) {
      // After shield breaks, it becomes like a standard enemy
      weakness = damageType === 'kinetic' ? 1.0 : 0.5;
    } else {
      // Use config weaknesses for non-shielded enemies
      weakness = this.config.weaknesses[damageType] || 1.0;
    }
    
    const finalDamage = amount * weakness;
    this.hp -= finalDamage;
    
    // Visual feedback based on effectiveness
    if (isCritical) {
      // CRITICAL HIT - Yellow/gold flash
      this.flashColor(0xffff00, 0.5);
      this.showDamageNumber(Math.floor(finalDamage), 0xffff00, true);
    } else {
      const isEffective = weakness >= 1.0;
      this.showDamageFlash(isEffective);
      this.showDamageNumber(finalDamage, isEffective);
    }

    console.log(`Enemy [${this.config.name}] HP: ${Math.round(this.hp)}/${this.maxHp} (${damageType} x${weakness}${isCritical ? ' CRIT' : ''})`);

    if (this.hp <= 0) {
      this.die();
    }
  }

  breakShield() {
    this.shieldBroken = true;
    console.log('💥 SHIELD DESTROYED! Switch to Kinetic for optimal damage!');
    
    // Remove shield visual
    if (this.shield && this.mesh) {
      this.mesh.remove(this.shield);
      this.shield.geometry.dispose();
      this.shield.material.dispose();
      this.shield = null;
    }
    
    // Remove wireframe
    if (this.shieldWireframe && this.mesh) {
      this.mesh.remove(this.shieldWireframe);
      this.shieldWireframe.geometry.dispose();
      this.shieldWireframe.material.dispose();
      this.shieldWireframe = null;
    }
    
    // Change core color to indicate vulnerability
    if (this.core) {
      this.core.material.color.setHex(0xff0000); // Red core = vulnerable
      this.core.material.emissive.setHex(0xff3333);
    }
  }

  showDamageFlash(isEffective) {
    // Red flash for effective, grey for ineffective
    const flashColor = isEffective ? 0xff0000 : 0x666666;
    this.flashColor(flashColor, 0.3);
  }
  
  flashColor(color, duration) {
    this.mesh.material.color.setHex(color);
    this.flashTimer = 0;
    this.flashDuration = duration * 1000;
    this.targetColor = this.originalColor.clone();
  }

  showDamageNumber(damage, colorOrEffective, isCritical = false) {
    // Handle both old (boolean) and new (hex color) signatures
    let color;
    if (typeof colorOrEffective === 'boolean') {
      color = colorOrEffective ? 'white' : '#888888';
    } else {
      color = `#${colorOrEffective.toString(16).padStart(6, '0')}`;
    }
    
    // Create floating damage number above enemy
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw damage text
    const damageText = Math.round(damage).toString();
    ctx.font = isCritical ? 'bold 80px Arial' : 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    
    if (isCritical) {
      // Add glow effect for crits
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 20;
    }
    
    ctx.fillText(damageText, 128, 80);

    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create sprite
    const geometry = new THREE.PlaneGeometry(isCritical ? 3 : 2, isCritical ? 1.5 : 1);
    const damageNumberMesh = new THREE.Mesh(geometry, material);
    damageNumberMesh.position.copy(this.mesh.position);
    damageNumberMesh.position.y += 2;

    // Add to scene temporarily
    const scene = this.mesh.parent.parent || this.mesh.parent;
    if (scene && scene.add) {
      scene.add(damageNumberMesh);

      // Animate floating text
      let floatProgress = 0;
      const floatSpeed = isCritical ? 0.04 : 0.05;
      const floatInterval = setInterval(() => {
        floatProgress += floatSpeed;
        damageNumberMesh.position.y += isCritical ? 0.15 : 0.1;
        material.opacity = 1 - floatProgress;
        
        // Make it face the camera
        if (window.game && window.game.camera) {
          damageNumberMesh.lookAt(window.game.camera.position);
        }

        if (floatProgress >= 1) {
          clearInterval(floatInterval);
          scene.remove(damageNumberMesh);
          geometry.dispose();
          texture.dispose();
          material.dispose();
        }
      }, 16);
    }
  }

  die() {
    this.isDead = true;
    console.log(`Enemy [${this.config.name}] defeated!`);
    
    // Play death animation
    this.playDeathEffect();
    
    // Spawn ALL configured resource drops
    const orbs = [];
    if (this.config.drops && Array.isArray(this.config.drops)) {
      this.config.drops.forEach(dropConfig => {
        // Roll for drop chance
        if (Math.random() <= dropConfig.chance) {
          // Spawn with slight position offset so they don't stack
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            0.5,
            (Math.random() - 0.5) * 1.5
          );
          
          const dropPos = this.position.clone().add(offset);
          
          const orb = new ResourceOrb(
            dropPos.x,
            dropPos.y,
            dropPos.z,
            dropConfig.type,
            dropConfig.amount
          );
          
          orbs.push(orb);
        }
      });
    }
    
    // Trigger death callback with orbs array
    if (this.onDeath) {
      this.onDeath(orbs);
    }
  }
  
  playDeathEffect() {
    // Explosion particles
    const scene = this.mesh.parent.parent || this.mesh.parent;
    if (!scene || !scene.add) return;
    
    for (let i = 0; i < 10; i++) {
      const particle = this.createDeathParticle();
      scene.add(particle);
      
      // Animate particle
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 3,
        (Math.random() - 0.5) * 5
      );
      
      this.animateParticle(particle, velocity, scene);
    }
  }
  
  createDeathParticle() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ 
      color: this.config.color || 0x888888,
      emissive: 0xff6600,
      emissiveIntensity: 0.5
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(this.position);
    return particle;
  }
  
  animateParticle(particle, velocity, scene) {
    let life = 1.0;
    const gravity = -9.8;
    
    const interval = setInterval(() => {
      velocity.y += gravity * 0.016;
      particle.position.add(velocity.clone().multiplyScalar(0.016));
      
      life -= 0.05;
      particle.material.opacity = life;
      particle.material.transparent = true;
      
      if (life <= 0) {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        clearInterval(interval);
      }
    }, 16);
  }

  getMesh() {
    return this.mesh;
  }
  
  update(timeScale = 1.0) {
    // Handle damage flash
    if (this.flashTimer < this.flashDuration) {
      const progress = this.flashTimer / this.flashDuration;
      // Lerp back to original color
      if (this.targetColor) {
        this.mesh.material.color.lerpColors(
          this.mesh.material.color,
          this.targetColor,
          progress
        );
      }
      this.flashTimer += 16 * timeScale;
    } else if (this.flashDuration > 0) {
      this.mesh.material.color.copy(this.originalColor);
      this.flashDuration = 0;
    }

    // Animate shield if present (scaled)
    if (this.shield) {
      this.shield.rotation.y += 0.01 * timeScale;
      this.shield.rotation.x = Math.sin(Date.now() * 0.001 * timeScale) * 0.1;
    }
    
    // Animate weak spot pulse
    if (this.weakSpotMesh) {
      this.weakSpotMesh.userData.pulseTime += 0.016 * timeScale * this.weakSpotMesh.userData.pulseSpeed;
      const pulse = Math.sin(this.weakSpotMesh.userData.pulseTime) * 0.3 + 0.7; // 0.4 to 1.0
      
      // Pulse the color brightness for MeshBasicMaterial
      const baseColor = this.weakSpotMesh.userData.baseColor;
      this.weakSpotMesh.material.color.setRGB(
        baseColor.r * pulse,
        baseColor.g * pulse,
        baseColor.b * pulse
      );
      
      // Update world position for raycasting
      this.weakSpotMesh.getWorldPosition(this.weakSpot.worldPosition);
    }
    
    // AI behavior
    this.updateAI(timeScale);
    
    // Apply movement
    this.mesh.position.add(this.velocity.clone().multiplyScalar(0.016 * timeScale));
    this.position.copy(this.mesh.position);
  }
  
  updateAI(timeScale) {
    // Need access to game/player - will be passed or accessed globally
    if (!window.game || !window.game.player) return;
    
    const playerPos = window.game.player.camera.getWorldPosition(new THREE.Vector3());
    const distanceToPlayer = this.position.distanceTo(playerPos);
    
    // Level 1: Tutorial mode - no movement, just rotate to face player
    if (this.aiMode === 'stationary') {
      this.velocity.set(0, 0, 0);
      // Still face player so they know enemies are "active"
      this.mesh.lookAt(new THREE.Vector3(playerPos.x, this.position.y, playerPos.z));
      return;
    }
    
    // Check if in chase range
    if (distanceToPlayer < this.chaseRange) {
      this.isChasing = true;
    }
    
    if (this.isChasing) {
      // Move toward player
      const direction = this.getChaseDirection(playerPos);
      
      // Simple separation from other enemies
      this.avoidOtherEnemies(direction);
      
      // Set velocity
      this.velocity.copy(direction.multiplyScalar(this.speed));
      
      // Rotate to face player
      this.mesh.lookAt(new THREE.Vector3(playerPos.x, this.position.y, playerPos.z));
      
      // Check if close enough to deal damage
      if (distanceToPlayer < this.attackRange) {
        this.attackPlayer();
      }
    } else {
      // Idle - slow down
      this.velocity.multiplyScalar(0.9);
    }
  }
  
  getChaseDirection(playerPos) {
    const direction = playerPos.clone().sub(this.position).normalize();
    direction.y = 0; // Stay on ground
    return direction;
  }
  
  avoidOtherEnemies(direction) {
    // Check nearby enemies
    if (!window.game || !window.game.enemies) return;
    
    window.game.enemies.forEach(other => {
      if (other === this) return;
      
      const distance = this.position.distanceTo(other.position);
      if (distance < 2.0) { // Too close
        // Push away from other enemy
        const away = this.position.clone().sub(other.position).normalize();
        direction.add(away.multiplyScalar(0.3));
      }
    });
    
    direction.normalize();
  }
  
  attackPlayer() {
    // Deal contact damage (rate-limited to once per second)
    const now = Date.now();
    if (!this.lastAttackTime || now - this.lastAttackTime > 1000) {
      if (window.game && window.game.player) {
        window.game.player.takeDamage(this.config.damage || 10);
        this.lastAttackTime = now;
        
        // Visual feedback - flash enemy
        this.flashColor(0xff0000, 0.3);
      }
    }
  }
  
  checkPlayerCollision(player) {
    // Now handled by attackPlayer() in updateAI
    // Keep this method for backwards compatibility but make it a no-op
    // The AI system handles collision damage now
  }
}
