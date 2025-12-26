import * as THREE from 'three';
import { ResourceOrb } from './ResourceOrb.js';
import { getEnemyConfig } from './config/enemies.js';

export class Enemy {
  constructor(x, y, z, type = 'standard') {
    this.position = new THREE.Vector3(x, y, z);
    this.type = type;
    this.config = getEnemyConfig(type);
    
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

    this.createMesh();
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

  takeDamage(amount, damageType = 'kinetic') {
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
    const isEffective = weakness >= 1.0;
    this.showDamageFlash(isEffective);
    this.showDamageNumber(finalDamage, isEffective);

    console.log(`Enemy [${this.config.name}] HP: ${Math.round(this.hp)}/${this.maxHp} (${damageType} x${weakness})`);

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
    
    this.mesh.material.color.setHex(flashColor);
    this.flashTimer = 0;
    this.flashDuration = 200;
    this.targetColor = this.originalColor.clone();
  }

  showDamageNumber(damage, isEffective) {
    // Create floating damage number above enemy
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw damage text
    const damageText = Math.round(damage).toString();
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = isEffective ? 'white' : '#888888';
    ctx.fillText(damageText, 128, 80);

    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create sprite
    const geometry = new THREE.PlaneGeometry(2, 1);
    const damageNumberMesh = new THREE.Mesh(geometry, material);
    damageNumberMesh.position.copy(this.mesh.position);
    damageNumberMesh.position.y += 2;

    // Add to scene temporarily
    const scene = this.mesh.parent.parent || this.mesh.parent;
    if (scene && scene.add) {
      scene.add(damageNumberMesh);

      // Animate floating text
      let floatProgress = 0;
      const floatInterval = setInterval(() => {
        floatProgress += 0.05;
        damageNumberMesh.position.y += 0.1;
        material.opacity = 1 - floatProgress;

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
    const orbs = this.createExplosion();
    
    // Trigger death callback with orbs
    if (this.onDeath) {
      orbs.forEach(orb => this.onDeath(orb));
    }
  }

  createExplosion() {
    // Particle explosion effect
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      const x = Math.cos(angle) * speed;
      const y = (Math.random() - 0.5) * speed;
      const z = Math.sin(angle) * speed;

      const particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff3300,
        emissiveIntensity: 0.8,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(this.mesh.position);
      particle.velocity = new THREE.Vector3(x, y, z);
      particle.gravity = 0.01;

      // Update particle
      const updateParticle = () => {
        particle.position.add(particle.velocity);
        particle.velocity.y -= particle.gravity;
        particle.material.emissiveIntensity -= 0.02;

        if (particle.material.emissiveIntensity > 0) {
          setTimeout(updateParticle, 16);
        } else {
          // This is managed by the game, would need to track particles
        }
      };
      updateParticle();
    }

    // Spawn resource orbs based on config drops
    const orbs = [];
    this.config.drops.forEach(drop => {
      // Roll for drop chance
      if (Math.random() <= drop.chance) {
        const orb = new ResourceOrb(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z,
          drop.type,
          drop.amount
        );
        orbs.push(orb);
      }
    });

    return orbs;
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
  }
}
