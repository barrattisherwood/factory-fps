# PHASE 7 QUICK REFERENCE

## 🏭 Factory UI Controls

| Key | Action |
|-----|--------|
| **TAB** | Toggle factory overlay |
| **ESC** | Close factory overlay |
| **1/2** | Switch ammo type |

---

## 📊 Factory Display Layout

```
╔═══════════════════════════════════════════╗
║      ORBITAL RIG - PRODUCTION             ║
╠═══════════════════════════════════════════╣
║ RESOURCES COLLECTED:                      ║
║ ├─ Metal:  45  [█████████░░]             ║
║ └─ Energy: 22  [████░░░░░░░]             ║
║                                           ║
║ ────────────────────────────────          ║
║                                           ║
║ [KINETIC PANEL]                           ║
║ ├─ Input: Metal (auto)                   ║
║ ├─ Output: Kinetic Ammo                  ║
║ ├─ Current Stock: 45 rounds              ║
║ └─ Status: Producing...                  ║
║                                           ║
║ [FLUX PANEL]                              ║
║ ├─ Input: Energy (auto)                  ║
║ ├─ Output: Flux Ammo                     ║
║ ├─ Current Stock: 12 rounds              ║
║ └─ Status: Low Resources                 ║
╚═══════════════════════════════════════════╝
```

---

## ⚙️ Production Pipeline

### Metal → Kinetic
```
Standard Enemy Killed
        ↓
Orange Orb Dropped
        ↓
Player Collects
        ↓
+10 Metal Resources
        ↓
+10 Kinetic Ammo (auto)
```

### Energy → Flux
```
Shielded Enemy Killed
        ↓
Blue Orb Dropped
        ↓
Player Collects
        ↓
+10 Energy Resources
        ↓
+10 Flux Ammo (auto)
```

---

## ⏱️ Time Scaling Behavior

| State | Speed | Can Move | Can Shoot | Enemies Move |
|-------|-------|----------|-----------|--------------|
| **Normal** | 100% | ✅ Full | ✅ Yes | ✅ Normal |
| **Factory Open** | 30% | ✅ Slow | ❌ No | ⚠️ Slow |

---

## 🎯 When to Open Factory

### Good Times
- ✅ Between enemy waves
- ✅ After clearing area
- ✅ Low on ammo, need to check resources
- ✅ Planning next target priority

### Risky Times
- ⚠️ In active firefight
- ⚠️ Surrounded by enemies
- ⚠️ While dodging bullets
- ⚠️ Low health situations

---

## 📈 Status Indicators

| Status | Meaning | Resource Count |
|--------|---------|----------------|
| **Producing...** | Normal operation | ≥ 10 |
| **Low Resources** | Warning state | < 10 |
| **Optimal Production** | High efficiency | > 50 |

---

## 🎨 Color Coding

| Element | Color | Hex Code |
|---------|-------|----------|
| Kinetic Panel | Orange | #ff6600 |
| Flux Panel | Blue | #00aaff |
| Panel Borders | Cyan | #00ffcc |
| Text | Light Grey | #e0e0e0 |
| Warnings | Yellow | #ffcc00 |

---

## 🧠 Strategic Tips

1. **Check Factory After Kills**
   - See what resources you gained
   - Plan your next target

2. **Low Energy? Target Shields**
   - Shielded enemies drop Energy
   - Energy produces Flux ammo

3. **Low Metal? Clear Standard Robots**
   - Standard enemies drop Metal
   - Metal produces Kinetic ammo

4. **Use 30% Slow Wisely**
   - Quick peek, don't linger
   - Enemies are slow but still dangerous
   - Get in, check status, get out

5. **Match Ammo to Enemy**
   - Check factory to see stocks
   - Switch before engaging
   - Don't waste wrong ammo type

---

## 🔧 Technical Notes

### Event System
- `resource:collected` - Orb picked up
- `production:produced` - Ammo created
- `resource:changed` - Resource count updated
- `ammo:changed` - Ammo count updated

### Auto-Production
- No manual crafting
- Instant conversion
- 1:1 ratio (simple)
- Background processing

### Time Scaling
- Affects ALL game systems
- Player movement
- Enemy animations
- Orb physics
- NOT a pause (tension maintained)

---

## 🐛 Known Behaviors

✅ **Working As Intended**
- Can still move while factory open (slowly)
- Enemies animate slowly (not frozen)
- Cannot shoot while factory open
- Factory closes on ESC or TAB

❌ **Not Bugs**
- Time doesn't pause (by design)
- Can't shoot in factory (tactical choice)
- Resources immediately convert (instant production)

---

## 📚 Related Documentation

- [PHASE_7_COMPLETE.md](./PHASE_7_COMPLETE.md) - Full implementation details
- [PHASE_6_COMPLETE.md](./PHASE_6_COMPLETE.md) - Dual ammo system
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - All game controls

---

## 🚀 Next Phase Preview

**Phase 8: Advanced Resource Management**
- Resource routing priorities
- Storage limits
- Efficiency upgrades
- Production rate boosts
- Overflow handling

**Phase 9: Production Upgrades**
- Panel efficiency tech tree
- Conversion ratio improvements
- Faster production cycles
- Unlock system

**Phase 10: Third Ammo Type**
- Thermal/Caustic ammo
- Exotic resource collection
- New enemy weaknesses
- Three production panels

---

**Factory UI is LIVE! Press TAB in-game to try it!** 🏭
