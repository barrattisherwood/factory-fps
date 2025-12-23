# 🎯 Phase 6: Dual Ammo System - Implementation Guide

## Status: 90% Complete! ✨

Thanks to the new architecture, implementing dual ammo is now **trivial**. Everything you need is already built!

---

## ✅ What's Already Done

### 1. AmmoManager (Complete)
```javascript
✅ Multiple ammo types (kinetic, flux, caustic)
✅ Switch between types: ammoManager.switchType('flux')
✅ Consume ammo: ammoManager.consume()
✅ Add ammo: ammoManager.add('flux', 10)
✅ Get current type: ammoManager.getCurrentType()
✅ Event system for UI updates
```

### 2. Damage Type System (Complete)
```javascript
✅ Enemy weakness system
✅ enemy.takeDamage(30, 'flux')
✅ Applies multiplier from config
✅ Different damage per ammo type
```

### 3. Visual Feedback (Complete)
```javascript
✅ Different bullet colors per type
✅ Different muzzle flash colors
✅ Different orb colors (metal=cyan, energy=blue, exotic=green)
```

### 4. Resource System (Complete)
```javascript
✅ Three resource types
✅ Auto-collection
✅ Proper ammo type mapping
```

---

## 🚀 What's Left to Implement (30 minutes)

### Step 1: Add Key Bindings (5 min)

**Add to Player.js:**

```javascript
onKeyDown(e) {
  this.keys[e.key.toLowerCase()] = true;
  
  // NEW: Ammo switching
  if (e.key === '1') {
    this.game.ammoManager.switchType('kinetic');
  } else if (e.key === '2') {
    this.game.ammoManager.switchType('flux');
  } else if (e.key === '3') {
    this.game.ammoManager.switchType('caustic');
  }
}
```

**That's it!** The AmmoManager already handles:
- Checking if ammo is available
- Emitting events for UI
- Updating current type

---

### Step 2: Enhance UI Display (15 min)

**Update UI.js to show all ammo types:**

```javascript
createUI() {
  // ... existing code ...
  
  // NEW: Multi-ammo display
  this.ammoDisplay = document.createElement('div');
  this.ammoDisplay.id = 'ammo-display';
  this.ammoDisplay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    font-family: 'Courier New', monospace;
    z-index: 100;
  `;
  document.body.appendChild(this.ammoDisplay);
  
  // Listen to full ammo state
  this.eventBus.on('ammo:state', (data) => {
    this.updateFullAmmoDisplay(data);
  });
  
  this.eventBus.on('ammo:switched', (data) => {
    this.updateFullAmmoDisplay({
      current: data.type,
      amounts: this.game.ammoManager.getAll()
    });
  });
}

updateFullAmmoDisplay(data) {
  const { current, amounts } = data;
  
  this.ammoDisplay.innerHTML = `
    <div style="margin-bottom: 8px; font-size: 18px; color: #fff;">
      AMMO
    </div>
    ${this.renderAmmoLine('kinetic', '1', amounts.kinetic, current === 'kinetic')}
    ${this.renderAmmoLine('flux', '2', amounts.flux, current === 'flux')}
    ${this.renderAmmoLine('caustic', '3', amounts.caustic, current === 'caustic')}
  `;
}

renderAmmoLine(type, key, amount, isActive) {
  const colors = {
    kinetic: '#ff9900',
    flux: '#00aaff',
    caustic: '#00ff00'
  };
  
  const color = colors[type];
  const opacity = isActive ? '1.0' : '0.5';
  const indicator = isActive ? '►' : ' ';
  
  return `
    <div style="
      font-size: 16px;
      color: ${color};
      opacity: ${opacity};
      text-shadow: 0 0 10px ${color}80;
      margin: 4px 0;
    ">
      ${indicator} [${key}] ${type.toUpperCase()}: ${amount}
    </div>
  `;
}
```

**Result:**
```
AMMO
► [1] KINETIC: 50   ← Active (bright)
  [2] FLUX: 0       ← Inactive (dim)
  [3] CAUSTIC: 0    ← Inactive (dim)
```

---

### Step 3: Spawn Enemy Variety (10 min)

**Update Game.js spawn logic:**

```javascript
spawnEnemies() {
  const enemyCount = 6; // Increased from 4
  const spawnRadius = 30;
  
  // Define enemy types to spawn
  const enemyTypes = [
    'standard',  // Weak to flux
    'standard',
    'shielded',  // Weak to kinetic
    'shielded',
    'heavy',     // Balanced
    'heavy'
  ];

  for (let i = 0; i < enemyCount; i++) {
    const angle = (i / enemyCount) * Math.PI * 2;
    const x = Math.cos(angle) * spawnRadius;
    const z = Math.sin(angle) * spawnRadius;

    // Use varied enemy types
    const type = enemyTypes[i];
    const enemy = new Enemy(x, 1.5, z, type);
    
    // Set death callback
    enemy.onDeath = (orb) => {
      this.addOrb(orb);
      this.removeEnemy(enemy);
    };

    this.enemies.push(enemy);
    this.scene.add(enemy.getMesh());
  }

  console.log(`Spawned ${enemyCount} varied enemies`);
}
```

---

## 🎮 Testing the System

### Test Checklist

1. **Start game** - Should see KINETIC: 50
2. **Shoot** - Ammo decreases, orange bullets
3. **Kill enemy** - Cyan orb spawns (metal)
4. **Collect orb** - KINETIC increases
5. **Press 2** - Switch to FLUX (should show "No flux ammo!")
6. **Kill shielded enemy** - Blue orb spawns (energy)
7. **Collect blue orb** - FLUX increases
8. **Press 2** - Switch to FLUX (should work now!)
9. **Shoot** - Blue bullets, different damage
10. **Press 1** - Switch back to KINETIC

---

## 🎨 Enemy Strategy

With the new system, players must use the right ammo:

```
Standard Enemies (Grey):
  • Weakness: Flux (1.5x damage)
  • Drops: Metal (kinetic ammo)
  • Strategy: Use flux to kill fast, get kinetic ammo

Shielded Enemies (Blue):
  • Weakness: Kinetic (shields resist flux)
  • Drops: Energy (flux ammo)
  • Strategy: Use kinetic to penetrate shields, get flux ammo

Heavy Enemies (Dark Grey):
  • Balanced weaknesses
  • Drops: Metal + Exotic (rare)
  • Strategy: Use any ammo, aim for rare drops
```

**Gameplay Loop:**
1. Kill standard enemies with flux → Get metal → Refill kinetic
2. Kill shielded enemies with kinetic → Get energy → Refill flux
3. Cycle between ammo types strategically

---

## 🔥 Advanced Features (Optional)

### Add Ammo Switching Animation

```javascript
// In Player.js
onKeyDown(e) {
  // ... existing code ...
  
  if (e.key === '1' || e.key === '2' || e.key === '3') {
    // Animate gun swap
    this.animateWeaponSwitch();
  }
}

animateWeaponSwitch() {
  // Quick gun hide/show animation
  const originalY = this.gunGroup.position.y;
  
  // Slide down
  const slideDown = setInterval(() => {
    this.gunGroup.position.y -= 0.02;
    if (this.gunGroup.position.y <= originalY - 0.3) {
      clearInterval(slideDown);
      
      // Slide back up
      const slideUp = setInterval(() => {
        this.gunGroup.position.y += 0.02;
        if (this.gunGroup.position.y >= originalY) {
          this.gunGroup.position.y = originalY;
          clearInterval(slideUp);
        }
      }, 16);
    }
  }, 16);
}
```

### Add Sound Effects

```javascript
// Listen to ammo switch event
game.events.on('ammo:switched', (data) => {
  // Play weapon switch sound
  soundManager.play('weapon_switch');
  
  // Play voice line
  voiceManager.play(`switched_to_${data.type}`);
});
```

### Add Tutorial Hints

```javascript
// In Game.js
setupTutorialHints() {
  this.events.on('ammo:empty', (data) => {
    ui.showHint(`Out of ${data.type}! Collect ${data.type} orbs or switch ammo`);
  });
  
  this.events.on('enemy:killed', (data) => {
    if (data.type === 'shielded') {
      ui.showHint('Shielded enemies are weak to kinetic ammo!');
    }
  });
}
```

---

## 📊 Config Tweaking

Balance the game by editing configs:

**Make flux more powerful but scarce:**
```javascript
// config/ammo.js
flux: {
  damage: 40,  // Increased from 30
  maxAmmo: 30, // Decreased from 50
  startingAmmo: 0
}
```

**Make standard enemies easier:**
```javascript
// config/enemies.js
standard: {
  hp: 75,  // Decreased from 100
  weaknesses: { 
    kinetic: 1.0, 
    flux: 2.0  // Increased from 1.5
  }
}
```

---

## 🎯 Completion Checklist

- [ ] Add key bindings (1/2/3)
- [ ] Update UI to show all ammo
- [ ] Spawn varied enemy types
- [ ] Test ammo switching
- [ ] Test weakness system
- [ ] Balance damage values
- [ ] Add ammo switch animation (optional)
- [ ] Add sound effects (optional)
- [ ] Add tutorial hints (optional)

---

## 🎉 You're Done!

Once you complete the 3 steps above, you'll have:

✅ **Full dual ammo system**  
✅ **Strategic enemy variety**  
✅ **Visual feedback (colors)**  
✅ **Balanced gameplay loop**  
✅ **Scalable to 10+ ammo types**  

The architecture makes it **trivial** to add more:
- Just add to `config/ammo.js`
- Add key binding
- UI updates automatically
- Everything else works!

---

## 🚀 Next Phase Ideas

After Phase 6, you could add:

- **Wave system** (spawn multiple waves)
- **Ammo crafting** (combine resources)
- **Weapon upgrades** (damage, fire rate)
- **Enemy AI** (movement, attacking)
- **Boss fights** (special mechanics)
- **Factory building** (Phase 7!)

All of these are easy thanks to the patterns you've implemented! 🎮✨
