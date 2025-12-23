import { getAmmoConfig } from '../config/ammo.js';

/**
 * AmmoManager - Manages all ammo types and switching
 * Prepares for Phase 6 dual ammo system
 */
export class AmmoManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.ammo = {};
    this.currentType = 'kinetic';
    
    // Initialize ammo from configs
    this.initializeAmmo();
  }

  /**
   * Initialize ammo from configuration
   */
  initializeAmmo() {
    const kineticConfig = getAmmoConfig('kinetic');
    const fluxConfig = getAmmoConfig('flux');
    const causticConfig = getAmmoConfig('caustic');

    this.ammo = {
      kinetic: kineticConfig.startingAmmo,
      flux: fluxConfig.startingAmmo,
      caustic: causticConfig.startingAmmo
    };

    // Emit initial ammo state
    this.emitAmmoState();
  }

  /**
   * Consume ammo when shooting
   * @param {string} type - Ammo type (optional, uses current)
   * @param {number} amount - Amount to consume
   * @returns {boolean} True if ammo was consumed
   */
  consume(type = this.currentType, amount = 1) {
    if (this.ammo[type] === undefined) {
      console.warn(`Unknown ammo type: ${type}`);
      return false;
    }

    if (this.ammo[type] >= amount) {
      this.ammo[type] -= amount;
      
      this.eventBus.emit('ammo:changed', {
        type,
        amount: this.ammo[type],
        delta: -amount
      });

      return true;
    }

    // No ammo available
    this.eventBus.emit('ammo:empty', { type });
    return false;
  }

  /**
   * Add ammo (from pickups)
   * @param {string} type - Ammo type
   * @param {number} amount - Amount to add
   */
  add(type, amount) {
    if (this.ammo[type] === undefined) {
      console.warn(`Unknown ammo type: ${type}`);
      return;
    }

    const config = getAmmoConfig(type);
    this.ammo[type] = Math.min(this.ammo[type] + amount, config.maxAmmo);

    this.eventBus.emit('ammo:changed', {
      type,
      amount: this.ammo[type],
      delta: amount
    });

    console.log(`+${amount} ${type} ammo (Total: ${this.ammo[type]}/${config.maxAmmo})`);
  }

  /**
   * Switch ammo type
   * @param {string} type - Ammo type to switch to
   * @returns {boolean} True if switched
   */
  switchType(type) {
    if (this.ammo[type] === undefined) {
      console.warn(`Unknown ammo type: ${type}`);
      return false;
    }

    if (this.ammo[type] <= 0) {
      console.log(`No ${type} ammo available!`);
      this.eventBus.emit('ammo:unavailable', { type });
      return false;
    }

    this.currentType = type;
    this.eventBus.emit('ammo:switched', {
      type,
      amount: this.ammo[type]
    });

    console.log(`Switched to ${type} (${this.ammo[type]} rounds)`);
    return true;
  }

  /**
   * Get current ammo amount
   * @param {string} type - Ammo type (optional, uses current)
   * @returns {number} Ammo amount
   */
  get(type = this.currentType) {
    return this.ammo[type] || 0;
  }

  /**
   * Get current ammo type
   * @returns {string} Current ammo type
   */
  getCurrentType() {
    return this.currentType;
  }

  /**
   * Get current ammo config
   * @returns {object} Ammo configuration
   */
  getCurrentConfig() {
    return getAmmoConfig(this.currentType);
  }

  /**
   * Get all ammo amounts
   * @returns {object} All ammo amounts
   */
  getAll() {
    return { ...this.ammo };
  }

  /**
   * Check if has ammo
   * @param {string} type - Ammo type (optional, uses current)
   * @returns {boolean} True if has ammo
   */
  hasAmmo(type = this.currentType) {
    return this.get(type) > 0;
  }

  /**
   * Emit current ammo state
   */
  emitAmmoState() {
    this.eventBus.emit('ammo:state', {
      current: this.currentType,
      amounts: this.getAll()
    });
  }

  /**
   * Reset ammo (for game restart)
   */
  reset() {
    this.initializeAmmo();
    this.eventBus.emit('ammo:reset');
  }
}
