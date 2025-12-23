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
      exotic: 0
    };
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
      exotic: 0
    };
    this.eventBus.emit('resource:reset');
  }
}
