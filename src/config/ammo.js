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
    maxAmmo: 300,             // Increased from 100
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
    maxAmmo: 200,             // Increased from 50
    startingAmmo: 0,          // Start with zero - must collect
    dropType: 'energy',       // Dropped by shielded robots
    flashIntensity: 4,
    flashDuration: 100,
    specialEffect: 'shield_piercing',
    description: 'Flux energy ammunition. 100% damage to shielded, 50% to standard.'
  },

  thermal: {
    name: 'Thermal Rounds',
    type: 'thermal',
    color: 0xff3300,          // Red/orange
    trailColor: 0xff6600,     // Orange trail
    glowColor: 0xff6633,
    damage: 25,               // Slightly higher base damage
    speed: 45,                // Slower projectiles
    maxAmmo: 200,             // Increased from 50
    startingAmmo: 0,          // Must be unlocked first
    dropType: 'thermal_core', // Dropped by heavy enemies
    flashIntensity: 5,
    flashDuration: 140,
    specialEffect: 'armor_piercing',
    particleTrail: true,      // Visual distinction
    trailParticles: 8,
    description: 'Superheated rounds effective against armored targets. 150% damage to heavy units.'
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

  thermal_core: {
    type: 'thermal_core',
    name: 'Thermal Core',
    color: 0xff3300,          // Red/orange glow (matches Thermal)
    emissiveColor: 0xff6600,
    lightColor: 0xff3300,
    ammoType: 'thermal',
    ammoAmount: 15           // Higher yield from heavy enemies
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
