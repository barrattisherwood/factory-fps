/**
 * Enemy configurations - Data-driven design for easy balancing
 * Add new enemy types without touching code
 */
export const ENEMY_CONFIGS = {
  standard: {
    name: 'Standard Robot',
    hp: 100,
    color: 0x444444,
    coreColor: 0xff0000,
    coreEmissive: 0xff3333,
    metalness: 0.8,
    roughness: 0.2,
    size: { width: 1.5, height: 3, depth: 1.5 },
    coreSize: 0.4,
    damage: 25, // Damage player takes per hit (for later)
    speed: 0, // Movement speed (for later AI)
    drops: [
      { type: 'metal', amount: 10, chance: 1.0 }
    ],
    weaknesses: {
      kinetic: 1.0, // Standard kinetic damage
      flux: 1.5     // 50% more damage from flux
    }
  },

  shielded: {
    name: 'Shielded Robot',
    hp: 150,
    color: 0x2244aa,
    coreColor: 0x0088ff,
    coreEmissive: 0x0099ff,
    metalness: 0.9,
    roughness: 0.1,
    size: { width: 1.5, height: 3, depth: 1.5 },
    coreSize: 0.4,
    damage: 30,
    speed: 0,
    drops: [
      { type: 'energy', amount: 10, chance: 1.0 }
    ],
    weaknesses: {
      kinetic: 0.5, // Resistant to kinetic (50% damage)
      flux: 1.0     // Normal flux damage
    },
    hasShield: true,
    shieldResistance: 0.5 // 50% kinetic reduction
  },

  heavy: {
    name: 'Heavy Robot',
    hp: 300,
    color: 0x666666,
    coreColor: 0xff6600,
    coreEmissive: 0xff8800,
    metalness: 0.9,
    roughness: 0.3,
    size: { width: 2, height: 4, depth: 2 },
    coreSize: 0.6,
    damage: 50,
    speed: 0,
    drops: [
      { type: 'metal', amount: 20, chance: 1.0 },
      { type: 'exotic', amount: 1, chance: 0.3 }
    ],
    weaknesses: {
      kinetic: 0.7, // Armored against kinetic
      flux: 1.2     // Slightly weak to flux
    }
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
