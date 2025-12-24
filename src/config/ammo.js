/**
 * Ammo/Weapon configurations - Data-driven design for dual ammo system
 * Makes Phase 6 implementation trivial
 */
export const AMMO_CONFIGS = {
  kinetic: {
    name: 'Kinetic Rounds',
    type: 'kinetic',
    color: 0xff6600,          // Orange/amber
    trailColor: 0xff6600,     // Solid orange line
    glowColor: 0xff9944,
    damage: 20,               // Phase 6 balance
    speed: 100,
    maxAmmo: 100,
    startingAmmo: 50,         // Starting with 50
    dropType: 'metal',        // Dropped by standard robots
    flashIntensity: 3,
    flashDuration: 120,
    description: 'Standard kinetic ammunition. 100% damage to unshielded, 25% to shielded.'
  },

  flux: {
    name: 'Flux Energy',
    type: 'flux',
    color: 0x00aaff,          // Electric blue
    trailColor: 0x00aaff,     // Blue line
    glowColor: 0x44bbff,
    damage: 20,               // Same base damage, but bonus multiplier vs shielded
    speed: 120,
    maxAmmo: 50,
    startingAmmo: 20,         // Start with enough to kill 1 shielded robot
    dropType: 'energy',       // Dropped by shielded robots
    flashIntensity: 4,
    flashDuration: 100,
    specialEffect: 'shield_piercing',
    description: 'Flux energy ammunition. 100% damage to shielded, 50% to standard.'
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
 * Resource drop configurations - Match ammo types with colors
 */
export const RESOURCE_CONFIGS = {
  metal: {
    type: 'metal',
    name: 'Metal Scrap',
    color: 0xff6600,          // Orange/amber glow (matches Kinetic)
    emissiveColor: 0xff9944,
    lightColor: 0xff6600,
    ammoType: 'kinetic',
    ammoAmount: 10
  },

  energy: {
    type: 'energy',
    name: 'Energy Cell',
    color: 0x00aaff,          // Electric blue glow (matches Flux)
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
