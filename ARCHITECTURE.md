# FPS Factory - Architecture Documentation

## 🎯 Overview

This project implements professional game development patterns for a scalable, maintainable FPS game. The architecture follows **composition over inheritance**, **event-driven design**, and **data-driven configuration**.

---

## 📁 Project Structure

```
factory-fps/
├── src/
│   ├── core/                   # Core architecture systems
│   │   ├── EventBus.js         # Decoupled event communication
│   │   ├── ObjectPool.js       # Performance optimization (GC-free)
│   │   └── GameObject.js       # Entity-Component System base
│   │
│   ├── managers/               # Game systems (Angular-style services)
│   │   ├── ResourceManager.js  # Metal, energy, exotic resources
│   │   └── AmmoManager.js      # Multi-ammo system (kinetic, flux, caustic)
│   │
│   ├── config/                 # Data-driven design files
│   │   ├── enemies.js          # Enemy type configurations
│   │   └── ammo.js             # Ammo/weapon configurations
│   │
│   ├── utils/                  # Helper utilities
│   │   └── DebugRenderer.js    # Visual debugging (press ` to toggle)
│   │
│   ├── Game.js                 # Main game loop
│   ├── Player.js               # Player controller
│   ├── Enemy.js                # Enemy entity
│   ├── ResourceOrb.js          # Collectible resources
│   └── UI.js                   # HUD interface
│
└── index.html
```

---

## 🏗️ Architecture Patterns

### 1. **EventBus Pattern** (Decoupling)

**Why:** Eliminates tight coupling between systems. UI, sound, quests don't need direct references.

**Usage:**
```javascript
// Emit events
game.events.emit('ammo:changed', { type: 'kinetic', amount: 42 });

// Listen to events
game.events.on('ammo:changed', (data) => {
  console.log(`Ammo: ${data.type} = ${data.amount}`);
});
```

**Current Events:**
- `ammo:changed` - Ammo amount changed
- `ammo:switched` - Player switched ammo type
- `ammo:empty` - Out of ammo
- `ammo:state` - Full ammo state
- `weapon:fired` - Weapon fired
- `enemy:killed` - Enemy defeated
- `resource:changed` - Resource collected

**Benefits:**
- Add new listeners without modifying existing code
- Easy to add achievements, analytics, sound effects
- Similar to Angular's EventEmitter pattern

---

### 2. **ObjectPool Pattern** (Performance)

**Why:** Avoid garbage collection spikes from creating/destroying bullets repeatedly.

**Usage:**
```javascript
// In Player.js - bullet tracers are pooled
const line = this.bulletPool.get();
// ... use line ...
this.bulletPool.release(line); // Return to pool
```

**Performance Impact:**
- ❌ Before: Create/destroy 50 bullets = 50 GC allocations
- ✅ After: Reuse same 50 bullets = 0 GC allocations

**Critical For:**
- Bullet tracers ✅ (Implemented)
- Particles (TODO)
- Enemies (TODO)
- VFX effects (TODO)

---

### 3. **Data-Driven Design** (Configuration Files)

**Why:** Balance changes without touching code. Easy to add new content.

**Enemy Config Example:**
```javascript
// config/enemies.js
standard: {
  hp: 100,
  damage: 25,
  weaknesses: { kinetic: 1.0, flux: 1.5 },
  drops: [{ type: 'metal', amount: 10, chance: 1.0 }]
}
```

**Ammo Config Example:**
```javascript
// config/ammo.js
kinetic: {
  damage: 25,
  color: 0xff6600,
  maxAmmo: 100,
  dropType: 'metal'
}
```

**Benefits:**
- Add new enemy types: Just edit config
- Balance tweaks: No code changes needed
- Non-programmers can modify balance
- JSON-ready for future asset loading

---

### 4. **Manager Pattern** (Service Layer)

**Why:** Single responsibility, testable, familiar from Angular.

**AmmoManager:**
```javascript
game.ammoManager.consume('kinetic', 1);  // Fire weapon
game.ammoManager.add('flux', 10);        // Collect ammo
game.ammoManager.switchType('flux');     // Change ammo
```

**ResourceManager:**
```javascript
game.resourceManager.add('metal', 50);
game.resourceManager.spend('energy', 20);
game.resourceManager.canAfford('exotic', 5);
```

**Benefits:**
- Clear ownership of data
- Easy to test in isolation
- Communicate via EventBus (decoupled)

---

### 5. **DebugRenderer** (Visual Debugging)

**Why:** Games are visual - debug visually!

**Toggle:** Press `` ` `` (backtick) to enable/disable

**Usage:**
```javascript
// Visualize raycast
debug.drawRay(origin, direction, 100, 0xff0000);

// Visualize collision sphere
debug.drawSphere(position, radius, 0x00ff00);

// Visualize hit point
debug.drawPoint(hitPosition, 0xff00ff);
```

**Benefits:**
- See raycasts, collisions, trigger zones
- Debug physics issues instantly
- Essential for FPS development

---

## 🎮 Current Implementation Status

### ✅ Completed
- [x] EventBus system
- [x] ObjectPool for bullets
- [x] Data-driven enemy configs
- [x] Data-driven ammo configs
- [x] ResourceManager
- [x] AmmoManager (ready for dual ammo)
- [x] DebugRenderer with hotkey toggle
- [x] Decoupled UI updates via events

### 🔜 Next Phase (Phase 6 - Dual Ammo)
Phase 6 is now **trivial** to implement thanks to the architecture:

1. **Ammo switching already works:**
   ```javascript
   game.ammoManager.switchType('flux');
   ```

2. **Different colored orbs already work:**
   ```javascript
   new ResourceOrb(x, y, z, 'energy', 10); // Blue orb
   ```

3. **Damage types already work:**
   ```javascript
   enemy.takeDamage(30, 'flux'); // Applies weakness multiplier
   ```

**To complete Phase 6:**
- Add key binding (1/2/3) to switch ammo types
- Update UI to show all ammo types
- Spawn different enemy types that require different ammo

---

## 🚀 How to Add New Content

### Add New Enemy Type
```javascript
// 1. Add to config/enemies.js
heavy: {
  hp: 300,
  color: 0x666666,
  weaknesses: { kinetic: 0.7, flux: 1.2 },
  drops: [
    { type: 'metal', amount: 20, chance: 1.0 },
    { type: 'exotic', amount: 1, chance: 0.3 }
  ]
}

// 2. Spawn it
const enemy = new Enemy(x, y, z, 'heavy');
```

### Add New Ammo Type
```javascript
// 1. Add to config/ammo.js
plasma: {
  damage: 40,
  color: 0xff00ff,
  maxAmmo: 30,
  dropType: 'plasma_cell'
}

// 2. It just works!
game.ammoManager.switchType('plasma');
```

### Listen to New Events
```javascript
// Add achievement system
game.events.on('enemy:killed', (data) => {
  achievements.checkProgress('kill_100_enemies');
});

// Add sound system
game.events.on('weapon:fired', (data) => {
  soundManager.play(`shoot_${data.type}`);
});
```

---

## 🎨 Design Principles

1. **Composition over Inheritance**
   - ❌ Deep class hierarchies
   - ✅ Mix & match components

2. **Decoupled Communication**
   - ❌ Direct references between systems
   - ✅ EventBus for loose coupling

3. **Data-Driven**
   - ❌ Hardcoded values in classes
   - ✅ Configuration files

4. **Performance-First**
   - ❌ Create/destroy every frame
   - ✅ Object pooling

5. **Visual Debugging**
   - ❌ Console.log for spatial problems
   - ✅ Draw debug shapes in scene

---

## 🔧 Debug Commands

- **`` ` ``** - Toggle visual debugging
- **W/A/S/D** - Move
- **Space** - Jump
- **Mouse** - Look around
- **Left Click** - Shoot

---

## 📝 Code Style Notes

- **Managers** use EventBus, never direct references
- **Configs** are pure data, no logic
- **Events** follow pattern: `category:action`
- **Object pools** for anything created frequently
- **Debug rendering** for all spatial operations

---

## 🎯 Next Steps

1. **Phase 6: Dual Ammo System** (Almost done!)
   - Add key bindings for ammo switching
   - Multi-ammo UI display
   - Spawn varied enemy types

2. **Phase 7: Factory Building** (Future)
   - Add BuildingManager
   - Panel placement system
   - Resource consumption

3. **Phase 8+: Advanced Features**
   - State Machine for game states
   - Entity-Component System for enemies
   - Quest/Mission system
   - Save/Load system

---

## 💡 Tips for Extending

**Adding a new system?**
1. Create a Manager class
2. Pass EventBus to constructor
3. Emit events for state changes
4. Don't store direct references to other managers

**Adding new behavior?**
1. Check if a config file makes sense
2. Use EventBus for cross-system communication
3. Add debug visualization if spatial
4. Consider object pooling if created frequently

**Performance problems?**
1. Check GC (garbage collection) spikes
2. Pool frequently created objects
3. Reduce object allocations in game loop
4. Use `debug.enabled` checks before expensive debug rendering

---

## 🏆 Benefits Achieved

✅ **Maintainability:** Clear separation of concerns  
✅ **Scalability:** Easy to add new content  
✅ **Performance:** Object pooling eliminates GC spikes  
✅ **Debuggability:** Visual debugging tools  
✅ **Flexibility:** Event-driven architecture  
✅ **Familiarity:** Angular-like patterns  

Your FPS Factory is now built on professional game architecture! 🎮✨
