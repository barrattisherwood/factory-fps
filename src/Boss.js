import * as THREE from 'three';
import { Enemy } from './Enemy.js';

/**
 * Boss Configuration
 */
const BOSS_CONFIG = {
  fluxWarden: {
    name: 'FLUX WARDEN',
    hp: 500,
    maxHp: 500,
    weaknesses: { kinetic: 1.0, flux: 0.5, thermal: 0.8 },
    contactDamage: 20,
    speed: 1.5,
    drops: {
      guaranteed: 'thermal_panel_blueprint',
      currency: 100
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
    
    // Make boss larger and more intimidating
    this.mesh.scale.set(2, 2, 2);
    
    // Change color to indicate boss status
    this.mesh.material.color.setHex(0xff0000); // Red
    this.originalColor = new THREE.Color(0xff0000);
    
    // Boss shield effect
    if (this.shield) {
      this.shield.material.color.setHex(0xff00ff); // Purple shield
      this.shield.material.emissive.setHex(0x880088);
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
      <div class="boss-hp-container">
        <div class="boss-hp-fill" style="width: 100%;"></div>
      </div>
      <div class="boss-hp-text">${this.hp} / ${this.maxHp}</div>
    `;
    document.body.appendChild(bossHpDiv);
  }
  
  takeDamage(amount, type = 'kinetic') {
    if (this.isDead) return;
    
    // Use boss-specific weaknesses
    const weakness = this.bossConfig.weaknesses[type] || 1.0;
    const finalDamage = amount * weakness;
    
    this.hp -= finalDamage;
    this.hp = Math.max(0, this.hp);
    
    // Visual feedback
    const isEffective = weakness >= 1.0;
    this.showDamageFlash(isEffective);
    this.showDamageNumber(finalDamage, isEffective);
    
    // Update boss health bar
    this.updateBossHealthBar();
    
    console.log(`Boss HP: ${Math.round(this.hp)}/${this.maxHp} (${type} x${weakness})`);
    
    if (this.hp <= 0) {
      this.die();
    }
  }
  
  updateBossHealthBar() {
    const percent = (this.hp / this.maxHp) * 100;
    const fill = document.querySelector('.boss-hp-fill');
    const text = document.querySelector('.boss-hp-text');
    
    if (fill) {
      fill.style.width = `${percent}%`;
    }
    if (text) {
      text.textContent = `${Math.round(this.hp)} / ${this.maxHp}`;
    }
  }
  
  die() {
    this.isDead = true;
    
    // Remove boss health bar
    const bossHpBar = document.getElementById('boss-health-bar');
    if (bossHpBar) {
      bossHpBar.remove();
    }
    
    // Drop guaranteed unlock
    this.dropUnlock();
    
    // Drop currency (resources)
    this.dropResources();
    
    // Emit boss defeated event
    if (window.game && window.game.events) {
      window.game.events.emit('boss:defeated', {
        type: this.bossType,
        name: this.bossConfig.name
      });
    }
    
    console.log(`Boss defeated: ${this.bossConfig.name}`);
    
    // Call parent onDeath callback to spawn orbs
    if (this.onDeath) {
      const orbs = this.createDeathOrbs();
      orbs.forEach(orb => this.onDeath(orb));
    }
    
    // Remove mesh after brief delay
    setTimeout(() => {
      if (this.mesh && this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
    }, 500);
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
      <h3>NEW BLUEPRINT ACQUIRED</h3>
      <p>${unlockData.name}</p>
      <p class="unlock-desc">${unlockData.description}</p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 4500);
  }
  
  dropResources() {
    // Boss drops extra resources
    const currency = this.bossConfig.drops.currency;
    console.log(`Boss dropped ${currency} resources`);
  }
  
  createDeathOrbs() {
    // Create orbs from config (like regular enemies)
    const orbs = [];
    
    // Drop multiple orbs for boss
    const { ResourceOrb } = require('../ResourceOrb.js');
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = 2;
      
      const orb = new ResourceOrb(
        this.mesh.position.x + Math.cos(angle) * distance,
        this.mesh.position.y,
        this.mesh.position.z + Math.sin(angle) * distance,
        'metal',
        20
      );
      orbs.push(orb);
    }
    
    return orbs;
  }
  
  update(timeScale = 1.0) {
    // Call parent update for animations
    super.update(timeScale);
    
    // Boss doesn't move yet (MVP)
    // Future: Add chase behavior or attack patterns
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
