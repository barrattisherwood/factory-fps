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
    this.onDeath = null; // Callback for when enemy dies

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
  }

  takeDamage(amount, damageType = 'kinetic') {
    if (this.isDead) return;

    // Apply weakness multiplier from config
    const weakness = this.config.weaknesses[damageType] || 1.0;
    const finalDamage = amount * weakness;

    this.hp -= finalDamage;
    this.flashTimer = 0;
    this.flashDuration = 200; // milliseconds

    console.log(`Enemy [${this.config.name}] HP: ${Math.round(this.hp)}/${this.maxHp} (${damageType} x${weakness})`);

    if (this.hp <= 0) {
      this.die();
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

  update() {
    // Handle damage flash
    if (this.flashTimer < this.flashDuration) {
      const progress = this.flashTimer / this.flashDuration;
      const flashColor = new THREE.Color(0xff0000).lerp(new THREE.Color(0x444444), progress);
      this.mesh.material.color.copy(flashColor);
      this.flashTimer += 16;
    } else if (this.flashDuration > 0) {
      this.mesh.material.color.setHex(0x444444);
      this.flashDuration = 0;
    }
  }
}
