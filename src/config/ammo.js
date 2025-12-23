/**
 * Ammo/Weapon configurations - Data-driven design for dual ammo system
 * Makes Phase 6 implementation trivial
 */
export const AMMO_CONFIGS = {
  kinetic: {
    name: 'Kinetic Rounds',
    type: 'kinetic',
    color: 0xff6600,
    trailColor: 0xffaa00,
    glowColor: 0xff9944,
    damage: 25,
    speed: 100, // Units per second
    maxAmmo: 100,
    startingAmmo: 50,
    dropType: 'metal', // What resource it drops from enemies
    flashIntensity: 3,
    flashDuration: 120, // milliseconds
    description: 'Standard ballistic ammunition. Effective against most targets.'
  },

  flux: {
    name: 'Flux Energy',
    type: 'flux',
    color: 0x00aaff,
    trailColor: 0x66ccff,
    glowColor: 0x44bbff,
    damage: 30,
    speed: 120,
    maxAmmo: 50,
    startingAmmo: 0, // Must be collected
    dropType: 'energy',
    flashIntensity: 4,
    flashDuration: 100,
    specialEffect: 'piercing', // Penetrates shields better
    description: 'Experimental energy weapon. Bypasses most shielding.'
  },

  caustic: {
    name: 'Caustic Charges',
    type: 'caustic',
    color: 0x00ff00,
    trailColor: 0x88ff00,
    glowColor: 0x44ff44,
    damage: 35,
    speed: 80,
    maxAmmo: 30,
    startingAmmo: 0,
    dropType: 'exotic',
    flashIntensity: 5,
    flashDuration: 150,
    specialEffect: 'damage_over_time',
    description: 'Corrosive projectiles. Deals damage over time.'
  }
};

/**
 * Resource drop configurations
 */
export const RESOURCE_CONFIGS = {
  metal: {
    type: 'metal',
    name: 'Metal Scrap',
    color: 0x00ffff,
    emissiveColor: 0x00ccff,
    lightColor: 0x00ffff,
    ammoType: 'kinetic',
    ammoAmount: 10
  },

  energy: {
    type: 'energy',
    name: 'Energy Cell',
    color: 0x00aaff,
    emissiveColor: 0x0088ff,
    lightColor: 0x00aaff,
    ammoType: 'flux',
    ammoAmount: 10
  },

  exotic: {
    type: 'exotic',
    name: 'Exotic Matter',
    color: 0x00ff00,
    emissiveColor: 0x00cc00,
    lightColor: 0x00ff00,
    ammoType: 'caustic',
    ammoAmount: 5
  }
};

/**
 * Get ammo config by type
 * @param {string} type - Ammo type key
 * @returns {object} Ammo configuration
 */
export function getAmmoConfig(type) {
  return AMMO_CONFIGS[type] || AMMO_CONFIGS.kinetic;
}

/**
 * Get resource config by type
 * @param {string} type - Resource type key
 * @returns {object} Resource configuration
 */
export function getResourceConfig(type) {
  return RESOURCE_CONFIGS[type] || RESOURCE_CONFIGS.metal;
}

/**
 * Get all available ammo types
 * @returns {Array<string>} Array of ammo type keys
 */
export function getAllAmmoTypes() {
  return Object.keys(AMMO_CONFIGS);
}
