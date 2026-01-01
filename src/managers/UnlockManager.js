/**
 * UnlockManager - Manages meta-progression unlocks (persisted in localStorage)
 * Phase 9: Roguelike unlock system
 */

export const UNLOCK_DATA = {
  thermal_panel_blueprint: {
    name: 'Thermal Panel',
    description: 'Produce Thermal ammunition from collected resources',
    type: 'panel',
    unlocked: false
  },
  // Future unlocks can be added here
};

export class UnlockManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
    this.unlocks = this.loadUnlocks();
    this.lastUnlock = null; // Track most recent unlock for display
  }
  
  loadUnlocks() {
    // Load from localStorage (persists between sessions)
    const saved = localStorage.getItem('fps_factory_unlocks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load unlocks, using defaults');
        return { ...UNLOCK_DATA };
      }
    }
    return { ...UNLOCK_DATA }; // Copy default state
  }
  
  saveUnlocks() {
    localStorage.setItem('fps_factory_unlocks', JSON.stringify(this.unlocks));
    console.log('Unlocks saved to localStorage');
  }
  
  unlock(unlockId) {
    if (this.unlocks[unlockId]) {
      if (!this.unlocks[unlockId].unlocked) {
        this.unlocks[unlockId].unlocked = true;
        this.lastUnlock = unlockId;
        this.saveUnlocks();
        console.log(`Unlocked: ${this.unlocks[unlockId].name}`);
        
        // Emit unlock event (Phase 9)
        if (this.eventBus) {
          this.eventBus.emit('unlock:acquired', unlockId);
        } else if (window.game && window.game.events) {
          window.game.events.emit('unlock:acquired', unlockId);
        }
        
        return true;
      }
    }
    return false;
  }
  
  isUnlocked(unlockId) {
    return this.unlocks[unlockId]?.unlocked || false;
  }
  
  getUnlockedPanels() {
    return Object.entries(this.unlocks)
      .filter(([id, data]) => data.type === 'panel' && data.unlocked)
      .map(([id, data]) => ({ id, ...data }));
  }
  
  getAllUnlocks() {
    return { ...this.unlocks };
  }
  
  reset() {
    localStorage.removeItem('fps_factory_unlocks');
    this.unlocks = { ...UNLOCK_DATA };
    this.lastUnlock = null;
    console.log('All unlocks reset');
  }
  
  getProgress() {
    const total = Object.keys(this.unlocks).length;
    const unlocked = Object.values(this.unlocks).filter(u => u.unlocked).length;
    return { unlocked, total, percent: (unlocked / total) * 100 };
  }
}
