/**
 * Enemy configurations - Data-driven design for easy balancing
 * Add new enemy types without touching code
 */
export const ENEMY_CONFIGS = {
  standard: {
    name: 'Standard Robot',
    hp: 100,
    color: 0x444444,          // Grey metallic
    coreColor: 0xff0000,
    coreEmissive: 0xff3333,
    metalness: 0.8,
    roughness: 0.2,
    size: { width: 1.5, height: 3, depth: 1.5 },
    coreSize: 0.4,
    damage: 25,
    speed: 0,
    drops: [
      { type: 'metal', amount: 10, chance: 1.0 }
    ],
    weaknesses: {
      kinetic: 1.0,           // 100% damage (20 per shot)
      flux: 0.5               // 50% damage (10 per shot)
    },
    hasShield: false
  },

  shielded: {
    name: 'Shielded Robot',
    hp: 150,
    color: 0x444444,          // Grey metallic with blue shield overlay
    coreColor: 0x0088ff,      // Blue core
    coreEmissive: 0x0099ff,
    metalness: 0.9,
    roughness: 0.1,
    size: { width: 1.5, height: 3, depth: 1.5 },
    coreSize: 0.4,
    damage: 30,
    speed: 0,
    drops: [
      { type: 'energy', amount: 10, chance: 1.0 }  // Blue orb drops
    ],
    weaknesses: {
      kinetic: 0.25,          // 25% damage - very resistant
      flux: 1.0               // 100% damage (20 per shot)
    },
    hasShield: true,          // Will show blue shield visual
    shieldColor: 0x00aaff,    // Electric blue
    shieldEmissive: 0x0088ff,
    shieldIntensity: 0.6
  },

  heavy: {
    name: 'Armored Unit',
    hp: 200,                  // Phase 9: Lower HP but very resistant
    color: 0x2a2a2a,          // Dark grey/black metallic
    coreColor: 0xff3300,      // Red glow (heat vulnerability indicator)
    coreEmissive: 0xff3300,
    metalness: 0.9,
    roughness: 0.3,
    size: { width: 2.25, height: 4.5, depth: 2.25 },  // 1.5x scale
    coreSize: 0.6,
    damage: 25,               // Higher contact damage
    speed: 0,                 // Slower movement (handled in Enemy.js)
    drops: [
      { type: 'thermal_core', amount: 15, chance: 1.0 },  // Always drops thermal
      { type: 'metal', amount: 5, chance: 0.5 }            // Bonus metal sometimes
    ],
    weaknesses: {
      kinetic: 0.3,           // Very resistant to bullets (30% damage)
      flux: 0.3,              // Very resistant to energy (30% damage)
      thermal: 1.5            // WEAK to heat (150% damage)
    },
    hasShield: false,
    description: 'Heavy combat chassis with reinforced plating. Vulnerable to thermal weapons.'
  }
};

/**
 * Get a random enemy type (for spawning variety)
 * @returns {string} Enemy type key
 */
export function getRandomEnemyType() {
  const types = Object.keys(ENEMY_CONFIGS);
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Get enemy config by type
 * @param {string} type - Enemy type key
 * @returns {object} Enemy configuration
 */
export function getEnemyConfig(type) {
  return ENEMY_CONFIGS[type] || ENEMY_CONFIGS.standard;
}
