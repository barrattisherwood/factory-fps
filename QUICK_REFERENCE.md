# 🎮 Quick Reference Guide

## Common Patterns Cheat Sheet

### 🔔 EventBus Usage

```javascript
// Emit an event
game.events.emit('event:name', { key: 'value' });

// Listen to an event
game.events.on('event:name', (data) => {
  console.log(data.key); // 'value'
});

// Unsubscribe
const callback = (data) => { /* ... */ };
game.events.on('event:name', callback);
game.events.off('event:name', callback);
```

### 💾 ObjectPool Usage

```javascript
// Get from pool
const obj = pool.get();

// Use object
obj.position.set(x, y, z);
scene.add(obj);

// Return to pool when done
scene.remove(obj);
pool.release(obj);
```

### 📊 Manager Usage

```javascript
// AmmoManager
game.ammoManager.consume();              // Use 1 ammo
game.ammoManager.add('flux', 10);        // Add ammo
game.ammoManager.switchType('flux');     // Switch type
game.ammoManager.hasAmmo();              // Check if has ammo
game.ammoManager.getCurrentConfig();     // Get current config

// ResourceManager
game.resourceManager.add('metal', 50);
game.resourceManager.spend('metal', 20);
game.resourceManager.canAfford('metal', 30);
game.resourceManager.get('metal');
```

### 🐛 Debug Rendering

```javascript
// Toggle: Press ` (backtick)

// Draw ray (shooting direction)
debug.drawRay(origin, direction, length, 0xff0000);

// Draw sphere (collision radius)
debug.drawSphere(position, radius, 0x00ff00);

// Draw point (hit location)
debug.drawPoint(position, 0xff00ff);

// Draw box (AABB collision)
debug.drawBox(position, size, 0xffff00);
```

### 📝 Config Access

```javascript
import { getEnemyConfig } from './config/enemies.js';
import { getAmmoConfig } from './config/ammo.js';

const config = getEnemyConfig('shielded');
console.log(config.hp); // 150

const ammo = getAmmoConfig('flux');
console.log(ammo.damage); // 30
```

### 🎯 Creating Entities

```javascript
// Enemy with type
const enemy = new Enemy(x, y, z, 'shielded');

// Resource orb with type
const orb = new ResourceOrb(x, y, z, 'energy', 10);
```

---

## 🎯 Current Event Reference

| Event | Data | Description |
|-------|------|-------------|
| `ammo:changed` | `{ type, amount, delta }` | Ammo amount changed |
| `ammo:switched` | `{ type, amount }` | Player switched ammo |
| `ammo:empty` | `{ type }` | Out of ammo |
| `ammo:state` | `{ current, amounts }` | Full ammo state |
| `weapon:fired` | `{ type, damage, position }` | Weapon fired |
| `enemy:killed` | `{ type, position }` | Enemy defeated |
| `resource:changed` | `{ type, amount, delta }` | Resource collected |

---

## 🏗️ Adding New Content

### Add Enemy Type

**1. Add to `config/enemies.js`:**
```javascript
boss: {
  name: 'Boss Robot',
  hp: 500,
  color: 0xff0000,
  coreColor: 0xffff00,
  size: { width: 3, height: 5, depth: 3 },
  weaknesses: { kinetic: 0.5, flux: 1.0 },
  drops: [
    { type: 'metal', amount: 50, chance: 1.0 },
    { type: 'exotic', amount: 5, chance: 1.0 }
  ]
}
```

**2. Spawn it:**
```javascript
const boss = new Enemy(0, 1.5, 0, 'boss');
game.enemies.push(boss);
game.scene.add(boss.getMesh());
```

### Add Ammo Type

**1. Add to `config/ammo.js`:**
```javascript
laser: {
  name: 'Laser Beam',
  type: 'laser',
  damage: 50,
  color: 0x00ff00,
  trailColor: 0x88ff00,
  maxAmmo: 20,
  startingAmmo: 0
}
```

**2. Use it:**
```javascript
game.ammoManager.switchType('laser');
```

### Add Event Listener

```javascript
// In any manager or class with access to game.events
game.events.on('my:event', (data) => {
  // Handle event
});

// Emit from anywhere
game.events.emit('my:event', { foo: 'bar' });
```

---

## 🎨 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **`` ` ``** | Toggle debug rendering |
| **W/A/S/D** | Move player |
| **Space** | Jump |
| **Mouse** | Look around |
| **Left Click** | Shoot |
| **1/2/3** | Switch ammo (coming soon) |

---

## 🔍 Debugging Tips

### Visualize Raycasts
```javascript
if (this.game.debug.enabled) {
  this.game.debug.drawRay(origin, direction, 100, 0xff0000);
}
```

### Check Hit Points
```javascript
if (hits.length > 0) {
  this.game.debug.drawPoint(hits[0].point, 0x00ff00);
}
```

### Visualize Collection Radius
```javascript
this.game.debug.drawSphere(orb.position, 2, 0x00ffff);
```

### Console Logging
```javascript
console.log(`Enemy HP: ${this.hp}/${this.maxHp}`);
```

---

## ⚡ Performance Tips

1. **Use ObjectPool for:**
   - Bullets/projectiles
   - Particles
   - Frequently spawned objects

2. **Check debug.enabled before expensive operations:**
   ```javascript
   if (this.game.debug.enabled) {
     // Expensive debug rendering
   }
   ```

3. **Emit events, don't store references:**
   ```javascript
   // ❌ Bad
   this.ui.updateAmmo(ammo);
   
   // ✅ Good
   events.emit('ammo:changed', { amount: ammo });
   ```

4. **Use configs for data:**
   ```javascript
   // ❌ Bad
   this.damage = 25;
   
   // ✅ Good
   this.damage = config.damage;
   ```

---

## 📦 File Locations

| Type | Location |
|------|----------|
| Core Systems | `src/core/` |
| Managers | `src/managers/` |
| Configs | `src/config/` |
| Utils | `src/utils/` |
| Entities | `src/` (root) |

---

## 🎯 Next Steps

1. **Phase 6:** Dual ammo switching (90% done!)
2. **Add ammo switch keys (1/2/3)**
3. **Multi-ammo UI display**
4. **Spawn enemy variety**

---

Happy coding! 🚀
