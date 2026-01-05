import * as THREE from 'three';
import { Enemy } from './Enemy.js';
import { ResourceOrb } from './ResourceOrb.js';

/**
 * Boss Configuration
 */
const BOSS_CONFIG = {
  fluxWarden: {
    name: 'FLUX WARDEN',
    hp: 800,
    maxHp: 800,
    weaknesses: { kinetic: 1.0, flux: 0.5, thermal: 0.8 },
    contactDamage: 20,
    speed: 1.5,
    weakSpot: {
      kineticMultiplier: 1.5,  // Reduced from 3.0x to 1.5x
      fluxMultiplier: 1.3,     // Reduced from 2.0x to 1.3x
      thermalMultiplier: 2.0   // Thermal gets 2x on weak spots
    },
    drops: {
      guaranteed: 'thermal_panel_blueprint',
      currency: 100,
      orbs: [
        { type: 'metal', amount: 50, count: 3 },
        { type: 'energy', amount: 50, count: 3 },
        { type: 'thermal_core', amount: 30, count: 2 }
      ]
    }
  }
};

/**
 * Boss - Enhanced enemy with health bar and guaranteed unlock drop
 * Phase 9: First boss - Flux Warden
 */
export class Boss extends Enemy {
  constructor(type = 'fluxWarden') {
    // Get boss config
    const config = BOSS_CONFIG[type];
    
    // Create as a shielded enemy base (for visuals)
    super(0, 1.5, 0, 'shielded');
    
    // Override with boss properties
    this.bossType = type;
    this.bossConfig = config;
    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.isBoss = true;
    
    // Override weakSpot with boss-specific multipliers
    if (this.weakSpot && config.weakSpot) {
      this.weakSpot.kineticMultiplier = config.weakSpot.kineticMultiplier;
      this.weakSpot.fluxMultiplier = config.weakSpot.fluxMultiplier;
      this.weakSpot.thermalMultiplier = config.weakSpot.thermalMultiplier;
    }
    
    // Make boss larger and more intimidating
    this.mesh.scale.set(2, 2, 2);
    
    // Change color to indicate boss status
    this.mesh.material.color.setHex(0xff0000); // Red
    this.originalColor = new THREE.Color(0xff0000);
    
    // Boss shield effect - boost shield HP
    if (this.shield) {
      this.shield.material.color.setHex(0xff00ff); // Purple shield
      this.shield.material.emissive.setHex(0x880088);
      // Increase boss shield HP from 100 to 250
      this.shieldHp = 250;
      this.maxShieldHp = 250;
    }
    
    // Create boss health bar UI
    this.createBossHealthBar();
    
    console.log(`Boss spawned: ${config.name} (${this.hp} HP)`);
  }
  
  createBossHealthBar() {
    const bossHpDiv = document.createElement('div');
    bossHpDiv.id = 'boss-health-bar';
    bossHpDiv.innerHTML = `
      <div class="boss-nameplate">${this.bossConfig.name}</div>
      <div class="boss-shield-container" style="margin-bottom: 5px;">
        <div class="boss-shield-fill" style="width: 100%; background: linear-gradient(90deg, #0088ff, #00ccff); height: 8px;"></div>
      </div>
      <div class="boss-shield-text" style="font-size: 12px; color: #00ccff; margin-bottom: 8px;">${this.shieldHp} / ${this.maxShieldHp} SHIELD</div>
      <div class="boss-hp-container">
        <div class="boss-hp-fill" style="width: 100%;"></div>
      </div>
      <div class="boss-hp-text">${this.hp} / ${this.maxHp} HP</div>
    `;
    document.body.appendChild(bossHpDiv);
  }
  
  // ====================================
  // BOSS DAMAGE SYSTEM - Clean Refactor
  // ====================================
  
  takeDamage(amount, type = 'kinetic', isCritical = false) {
    if (this.isDead) return;
    
    // Shield absorbs damage if active
    if (this.hasActiveShield()) {
      this.damageShield(amount, type);
      return;
    }
    
    // Calculate final damage
    const damageInfo = this.calculateDamage(amount, type, isCritical);
    
    // Apply to HP
    this.applyDamage(damageInfo.final);
    
    // Visual feedback
    this.showDamageFeedback(damageInfo, type, isCritical);
    
    // Update UI
    this.updateBossHealthBar();
    
    // Check death
    if (this.hp <= 0) {
      this.die();
    }
  }
  
  // ---- Shield System ----
  
  hasActiveShield() {
    return this.hasShield && 
           !this.shieldBroken && 
           this.shieldHp > 0;
  }
  
  damageShield(amount, type) {
    const resistance = this.getShieldResistance(type);
    const damage = amount * resistance;
    
    this.shieldHp = Math.max(0, this.shieldHp - damage);
    
    this.updateShieldVisuals();
    this.showShieldDamageFeedback(damage, type, resistance >= 1.0);
    
    // Update boss health bar (includes shield bar)
    this.updateBossHealthBar();
    
    if (this.shieldHp <= 0) {
      this.breakShield();
    }
  }
  
  getShieldResistance(type) {
    const resistances = {
      'flux': 1.0,
      'kinetic': 0.1,
      'thermal': 0.1
    };
    return resistances[type] || 0.1;
  }
  
  updateShieldVisuals() {
    if (!this.shield) return;
    
    const percent = this.shieldHp / this.maxShieldHp;
    this.shield.material.opacity = 0.3 * percent;
    this.shield.material.emissiveIntensity = 0.5 * percent;
  }
  
  // ---- Damage Calculation ----
  
  calculateDamage(baseAmount, type, isCritical) {
    const weakness = this.bossConfig.weaknesses[type] || 1.0;
    const critMultiplier = isCritical ? (this.bossConfig.critMultiplier || 1.5) : 1.0;
    
    const finalDamage = baseAmount * weakness * critMultiplier;
    
    return {
      base: baseAmount,
      weakness: weakness,
      critMultiplier: critMultiplier,
      final: finalDamage
    };
  }
  
  applyDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
  
  // ---- Visual Feedback ----
  
  showDamageFeedback(damageInfo, type, isCritical) {
    if (isCritical) {
      this.showCriticalFeedback(damageInfo.final);
    } else {
      this.showNormalFeedback(damageInfo.final, damageInfo.weakness >= 1.0);
    }
  }
  
  showCriticalFeedback(amount) {
    super.flashColor(0xffff00, 0.5);
    super.showDamageNumber(Math.floor(amount), 0xffff00, true);
  }
  
  showNormalFeedback(amount, isEffective) {
    const flashColor = isEffective ? 0xff0000 : 0x666666;
    const flashIntensity = isEffective ? 0.3 : 0.15;
    const numberColor = isEffective ? 0xffffff : 0x888888;
    
    super.flashColor(flashColor, flashIntensity);
    super.showDamageNumber(Math.floor(amount), numberColor, false);
  }
  
  showShieldDamageFeedback(amount, type, isEffective) {
    super.flashColor(0x00aaff, isEffective ? 0.4 : 0.2);
    super.showDamageNumber(
      Math.floor(amount), 
      isEffective ? 0x00aaff : 0x888888, 
      false
    );
  }
  
  updateBossHealthBar() {
    const hpPercent = (this.hp / this.maxHp) * 100;
    const hpFill = document.querySelector('.boss-hp-fill');
    const hpText = document.querySelector('.boss-hp-text');
    
    if (hpFill) {
      hpFill.style.width = `${hpPercent}%`;
    }
    if (hpText) {
      hpText.textContent = `${Math.round(this.hp)} / ${this.maxHp} HP`;
    }
    
    // Update shield bar
    const shieldPercent = (this.shieldHp / this.maxShieldHp) * 100;
    const shieldFill = document.querySelector('.boss-shield-fill');
    const shieldText = document.querySelector('.boss-shield-text');
    
    if (shieldFill) {
      shieldFill.style.width = `${shieldPercent}%`;
      // Hide shield bar if broken
      if (this.shieldBroken) {
        shieldFill.parentElement.style.display = 'none';
        if (shieldText) shieldText.style.display = 'none';
      }
    }
    if (shieldText && !this.shieldBroken) {
      shieldText.textContent = `${Math.round(this.shieldHp)} / ${this.maxShieldHp} SHIELD`;
    }
  }
  
  die() {
    this.isDead = true;
    console.log(`🎯 Boss defeated: ${this.bossConfig.name}`);
    console.log('Boss config drops:', this.bossConfig.drops);
    
    // Remove boss health bar
    const bossHpBar = document.getElementById('boss-health-bar');
    if (bossHpBar) {
      bossHpBar.remove();
    }
    
    // Play dramatic death effect
    this.playBossDeathEffect();
    
    // DROP VICTORY ORBS (The fix!)
    const orbs = this.createVictoryRewardOrbs();
    
    // Drop guaranteed unlock
    console.log('About to call dropUnlock()...');
    this.dropUnlock();
    console.log('dropUnlock() completed');
    
    // Emit boss defeated event
    if (window.game && window.game.events) {
      window.game.events.emit('boss:defeated', {
        type: this.bossType,
        name: this.bossConfig.name
      });
    }
    
    // Call parent onDeath callback to spawn orbs
    if (this.onDeath) {
      this.onDeath(orbs);
    }
    
    // Remove mesh after brief delay
    setTimeout(() => {
      if (this.mesh && this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
    }, 500);
  }
  
  createVictoryRewardOrbs() {
    console.log('Creating boss victory reward orbs...');
    const orbs = [];
    
    // Get orb drops from config
    const orbDrops = this.bossConfig.drops.orbs || [];
    
    orbDrops.forEach(reward => {
      for (let i = 0; i < reward.count; i++) {
        // Spawn orbs in expanding circle around boss
        const angle = (i / reward.count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 3 + Math.random() * 1; // 3-4 unit radius
        
        const offset = new THREE.Vector3(
          Math.cos(angle) * radius,
          0.5,
          Math.sin(angle) * radius
        );
        
        const dropPos = this.position.clone().add(offset);
        
        const orb = new ResourceOrb(
          dropPos.x,
          dropPos.y,
          dropPos.z,
          reward.type,
          reward.amount
        );
        
        orbs.push(orb);
        console.log(`Created ${reward.type} orb (+${reward.amount})`);
      }
    });
    
    console.log(`Total victory orbs created: ${orbs.length}`);
    return orbs;
  }
  
  playBossDeathEffect() {
    // Dramatic explosion with more particles
    const scene = this.mesh.parent;
    if (!scene || !scene.add) return;
    
    for (let i = 0; i < 30; i++) {
      const particle = this.createBossDeathParticle();
      scene.add(particle);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6,
        (Math.random() - 0.5) * 8
      );
      
      this.animateBossParticle(particle, velocity, scene);
    }
    
    // Screen shake
    this.screenShake(0.5, 500);
  }
  
  createBossDeathParticle() {
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff6600,
      emissiveIntensity: 1.0
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(this.position);
    return particle;
  }
  
  animateBossParticle(particle, velocity, scene) {
    let life = 1.0;
    const gravity = -9.8;
    
    const interval = setInterval(() => {
      velocity.y += gravity * 0.016;
      particle.position.add(velocity.clone().multiplyScalar(0.016));
      
      life -= 0.03;
      particle.material.emissiveIntensity = life;
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
  
  screenShake(intensity, duration) {
    if (!window.game || !window.game.camera) return;
    
    const camera = window.game.camera;
    const originalPos = camera.position.clone();
    const startTime = Date.now();
    
    const shakeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1.0) {
        camera.position.copy(originalPos);
        clearInterval(shakeInterval);
        return;
      }
      
      // Decreasing shake over time
      const currentIntensity = intensity * (1 - progress);
      
      camera.position.x = originalPos.x + (Math.random() - 0.5) * currentIntensity;
      camera.position.y = originalPos.y + (Math.random() - 0.5) * currentIntensity;
      camera.position.z = originalPos.z + (Math.random() - 0.5) * currentIntensity;
    }, 16);
  }
  
  dropUnlock() {
    const unlockId = this.bossConfig.drops.guaranteed;
    
    if (window.game && window.game.unlockManager) {
      const wasUnlocked = window.game.unlockManager.unlock(unlockId);
      
      if (wasUnlocked) {
        this.showUnlockNotification(unlockId);
      } else {
        console.log('Unlock already acquired');
      }
    }
  }
  
  showUnlockNotification(unlockId) {
    const unlockData = window.game.unlockManager.unlocks[unlockId];
    
    const notification = document.createElement('div');
    notification.className = 'unlock-notification';
    notification.innerHTML = `
      <h2>🔓 NEW BLUEPRINT ACQUIRED</h2>
      <h3>${unlockData.name}</h3>
      <p class="unlock-desc">${unlockData.description}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 4500);
  }
  
  update(timeScale = 1.0) {
    // Call parent update for animations
    super.update(timeScale);
    
    // Boss chases player
    if (!this.isDead && window.game && window.game.player) {
      const playerPos = window.game.player.camera.getWorldPosition(new THREE.Vector3());
      const direction = new THREE.Vector3().subVectors(playerPos, this.position);
      direction.y = 0; // Only move on horizontal plane
      direction.normalize();
      
      // Move towards player (slower than regular enemies due to size)
      const moveSpeed = this.bossConfig.speed * 0.015 * timeScale; // Slower movement
      this.position.add(direction.multiplyScalar(moveSpeed));
      this.mesh.position.copy(this.position);
      
      // Update weak spot position if it exists
      if (this.weakSpot && this.weakSpot.worldPosition && this.weakSpotMesh) {
        this.weakSpotMesh.getWorldPosition(this.weakSpot.worldPosition);
      }
    }
  }
  
  checkPlayerCollision(player) {
    // Boss contact damage
    if (!player || this.isDead) return;
    
    const playerPos = player.camera.getWorldPosition(new THREE.Vector3());
    const distanceToPlayer = this.position.distanceTo(playerPos);
    
    // Larger collision radius for boss (scaled 2x)
    if (distanceToPlayer < 4.0) {
      player.takeDamage(this.bossConfig.contactDamage);
      
      // Push enemy back
      const pushDir = this.position.clone().sub(playerPos).normalize();
      this.position.add(pushDir.multiplyScalar(1.0));
      this.mesh.position.copy(this.position);
    }
  }
}

export { BOSS_CONFIG };
