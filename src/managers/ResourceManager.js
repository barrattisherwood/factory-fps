/**
 * ResourceManager - Manages all resource types (metal, energy, exotic)
 * Angular-style service pattern
 */
export class ResourceManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.resources = {
      metal: 0,
      energy: 0,
      thermal_core: 0  // Phase 9: For thermal ammo production
    };
    this.ammoManager = null;
    this.unlockManager = null;  // Phase 9: Check unlocks
  }

  /**
   * Optional: set AmmoManager instance so resources auto-produce ammo
   */
  setAmmoManager(ammoManager) {
    this.ammoManager = ammoManager;
  }
  
  /**
   * Optional: set UnlockManager instance to check unlocks (Phase 9)
   */
  setUnlockManager(unlockManager) {
    this.unlockManager = unlockManager;
  }

  /**
   * Collect resource (used by orbs). Just stores - NO auto-conversion.
   */
  collectResource(type, amount) {
    this.add(type, amount);
    this.eventBus.emit('resource:collected', { type, amount });
  }

  /**
   * Add resources
   * @param {string} type - Resource type
   * @param {number} amount - Amount to add
   */
  add(type, amount) {
    if (this.resources[type] === undefined) {
      console.warn(`Unknown resource type: ${type}`);
      return;
    }

    this.resources[type] += amount;
    this.eventBus.emit('resource:changed', {
      type,
      amount: this.resources[type],
      delta: amount
    });

    console.log(`+${amount} ${type} (Total: ${this.resources[type]})`);
  }

  /**
   * Spend resources
   * @param {string} type - Resource type
   * @param {number} amount - Amount to spend
   * @returns {boolean} True if successful
   */
  spend(type, amount) {
    if (this.resources[type] === undefined) {
      console.warn(`Unknown resource type: ${type}`);
      return false;
    }

    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      this.eventBus.emit('resource:changed', {
        type,
        amount: this.resources[type],
        delta: -amount
      });
      return true;
    }

    console.log(`Not enough ${type}! (Need: ${amount}, Have: ${this.resources[type]})`);
    return false;
  }

  /**
   * Get current amount of a resource
   * @param {string} type - Resource type
   * @returns {number} Current amount
   */
  get(type) {
    return this.resources[type] || 0;
  }

  /**
   * Get all resources
   * @returns {object} All resources
   */
  getAll() {
    return { ...this.resources };
  }

  /**
   * Check if can afford
   * @param {string} type - Resource type
   * @param {number} amount - Amount to check
   * @returns {boolean} True if can afford
   */
  canAfford(type, amount) {
    return this.get(type) >= amount;
  }

  /**
   * Reset all resources (for game restart)
   */
  reset() {
    this.resources = {
      metal: 0,
      energy: 0,
      thermal_core: 0
    };
    this.eventBus.emit('resource:reset');
  }

  /**
   * Manual conversion: Convert resources to ammo
   * @param {string} resourceType - Resource type (metal, energy, thermal_core)
   * @param {number} amount - Amount to convert
   * @returns {boolean} True if successful
   */
  convertToAmmo(resourceType, amount) {
    // Validate we have enough
    if (this.resources[resourceType] < amount) {
      console.warn(`Not enough ${resourceType}: have ${this.resources[resourceType]}, need ${amount}`);
      return false;
    }

    // Convert to appropriate ammo type
    const ammoTypeMap = {
      'metal': 'kinetic',
      'energy': 'flux',
      'thermal_core': 'thermal'
    };

    const ammoType = ammoTypeMap[resourceType];

    if (!ammoType) {
      console.error(`Unknown resource type: ${resourceType}`);
      return false;
    }

    // Check if ammo type is unlocked
    if (ammoType === 'thermal' && this.unlockManager && !this.unlockManager.isUnlocked('thermal_panel_blueprint')) {
      console.warn('Thermal ammo not unlocked');
      return false;
    }

    // Check if we have ammo manager
    if (!this.ammoManager) {
      console.error('AmmoManager not set');
      return false;
    }

    // Deduct from resources
    this.resources[resourceType] -= amount;

    // Add to ammo (1:1 conversion)
    const success = this.ammoManager.refill(ammoType, amount);

    if (success) {
      this.eventBus.emit('resource:converted', {
        resourceType,
        ammoType,
        amount,
        remaining: this.resources[resourceType]
      });
      this.eventBus.emit('resource:changed', {
        type: resourceType,
        amount: this.resources[resourceType],
        delta: -amount
      });
      console.log(`Converted ${amount} ${resourceType} → ${amount} ${ammoType}`);
    } else {
      // Refund if conversion failed
      this.resources[resourceType] += amount;
    }

    return success;
  }

  /**
   * Helper to convert all of a resource type
   * @param {string} resourceType - Resource type
   * @returns {boolean} True if successful
   */
  convertAll(resourceType) {
    const amount = this.resources[resourceType];
    if (amount === 0) return false;
    return this.convertToAmmo(resourceType, amount);
  }
}
