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
    speed: 2.0,               // Fast movement
    drops: [
      { type: 'metal', amount: 15, chance: 1.0 }  // Increased from 10
    ],
    weaknesses: {
      kinetic: 1.0,           // 100% damage (20 per shot)
      flux: 0.5               // 50% damage (10 per shot)
    },
    hasShield: false,
    weakSpot: {
      position: { x: 0, y: 0.8, z: 0.9 },  // Front, slightly above center
      radius: 0.3,                        // Hit detection sphere
      kineticMultiplier: 3.0,             // 3x damage on crit
      fluxMultiplier: 2.0,                // 2x damage on crit with energy
      visualColor: 0xff6600,              // Bright orange for visibility
      label: 'Core'
    }
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
    speed: 1.5,               // Medium movement
    drops: [
      { type: 'energy', amount: 15, chance: 1.0 },  // Increased from 10
      { type: 'metal', amount: 10, chance: 0.7 }     // NEW: Also drops metal
    ],
    weaknesses: {
      kinetic: 0.25,          // 25% damage - very resistant
      flux: 1.0               // 100% damage (20 per shot)
    },
    hasShield: true,          // Will show blue shield visual
    shieldColor: 0x00aaff,    // Electric blue
    shieldEmissive: 0x0088ff,
    shieldIntensity: 0.6,
    weakSpot: {
      position: { x: 0, y: 0.5, z: 0.9 },  // Front, center height
      radius: 0.25,                       // Smaller = harder
      kineticMultiplier: 4.0,             // 4x damage (kinetic can crit)
      // No flux multiplier - energy doesn't crit shields
      visualColor: 0xffff00,              // Bright yellow for visibility
      label: 'Power Core'
    }
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
    speed: 1.2,               // Slow movement
    drops: [
      { type: 'thermal_core', amount: 15, chance: 1.0 },  // Thermal core drop
      { type: 'metal', amount: 15, chance: 0.8 },         // Increased: Usually drops metal
      { type: 'energy', amount: 10, chance: 0.5 }         // NEW: Sometimes energy
    ],
    weaknesses: {
      kinetic: 0.3,           // Very resistant to bullets (30% damage)
      flux: 0.3,              // Very resistant to energy (30% damage)
      thermal: 1.5            // WEAK to heat (150% damage)
    },
    hasShield: false,
    description: 'Heavy combat chassis with reinforced plating. Vulnerable to thermal weapons.',
    weakSpot: {
      position: { x: 0, y: 1.5, z: 1.3 },  // Front, higher up to be visible on tall enemy
      radius: 0.35,                        // Larger for visibility on big enemy
      kineticMultiplier: 5.0,             // 5x damage (compensates for 0.3 resistance)
      visualColor: 0xff3300,              // Bright red for visibility
      label: 'Heat Vent'
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
