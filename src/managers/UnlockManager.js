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
    console.log('Loading unlocks from localStorage:', saved);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Parsed unlocks:', parsed);
        return parsed;
      } catch (e) {
        console.warn('Failed to load unlocks, using defaults');
        return { ...UNLOCK_DATA };
      }
    }
    
    console.log('No saved unlocks found, using defaults');
    return { ...UNLOCK_DATA }; // Copy default state
  }
  
  saveUnlocks() {
    localStorage.setItem('fps_factory_unlocks', JSON.stringify(this.unlocks));
    console.log('Unlocks saved to localStorage:', this.unlocks);
  }
  
  // Debug method - expose to window for testing
  debugUnlocks() {
    console.log('Current unlocks:', this.unlocks);
    console.log('Thermal unlocked?', this.isUnlocked('thermal_panel_blueprint'));
    console.log('localStorage:', localStorage.getItem('fps_factory_unlocks'));
  }
  
  unlock(unlockId) {
    console.log(`Attempting to unlock: ${unlockId}`);
    console.log(`Current unlock state:`, this.unlocks[unlockId]);
    
    if (this.unlocks[unlockId]) {
      if (!this.unlocks[unlockId].unlocked) {
        this.unlocks[unlockId].unlocked = true;
        this.lastUnlock = unlockId;
        this.saveUnlocks();
        console.log(`✅ Successfully unlocked: ${this.unlocks[unlockId].name}`);
        
        // Emit unlock event (Phase 9)
        if (this.eventBus) {
          this.eventBus.emit('unlock:acquired', unlockId);
        } else if (window.game && window.game.events) {
          window.game.events.emit('unlock:acquired', unlockId);
        }
        
        return true;
      } else {
        console.log(`Already unlocked: ${this.unlocks[unlockId].name}`);
      }
    } else {
      console.error(`Unknown unlock ID: ${unlockId}`);
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
