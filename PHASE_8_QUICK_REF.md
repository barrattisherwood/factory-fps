# PHASE 8 QUICK REFERENCE

## 🚀 Start the Game

```bash
npm run dev
```

Open browser to: `http://localhost:5173`

---

## 🎮 Game Loop

1. **Main Menu** → Click "START MISSION"
2. **Wave 1-5** → Defeat all enemies
3. **Wave Transition** → 5 second countdown
4. **Victory/Defeat** → View stats, replay

---

## ⚡ Key Systems

### State Management
```javascript
GameStateManager
├── MAIN_MENU
├── PLAYING
├── WAVE_TRANSITION
├── PAUSED
├── VICTORY
└── DEFEAT
```

### Wave System
```javascript
WaveManager
├── Wave 1: 5 enemies (3 standard, 2 shielded)
├── Wave 2: 8 enemies
├── Wave 3: 12 enemies
├── Wave 4: 15 enemies
└── Wave 5: 20 enemies (FINAL SIEGE)
```

### Health System
```javascript
Player
├── Max HP: 100
├── Damage: 10 per enemy collision
├── Invulnerability: 1 second cooldown
└── Death: HP = 0 → DEFEAT screen
```

---

## 📊 Statistics

Tracked automatically:
- Enemies killed (by type)
- Accuracy % (hits / shots fired)
- Resources collected
- Favorite ammo type
- Play time
- Damage taken

---

## 🎨 UI Components

| Screen | Purpose | Exit |
|--------|---------|------|
| Main Menu | Start game, info | Start button |
| How to Play | Controls guide | Back button |
| Wave Transition | Countdown between waves | Auto (5s) |
| Pause Menu | Mid-game menu | Resume/ESC |
| Victory | Win celebration + stats | Play Again |
| Defeat | Loss screen + stats | Try Again |

---

## 🔊 Sound Events

- `weapon:fired` → Shoot sound
- `enemy:hit` → Hit sound
- `resource:collected` → Pickup sound
- `wave:started` → Alert sound
- `player:damaged` → Hurt sound

---

## 🎯 Testing Tips

1. **Test Death**: Let enemies hit you 10 times
2. **Test Victory**: Use godmode (comment out takeDamage)
3. **Test Pause**: Press ESC during gameplay
4. **Test Stats**: Complete a full run, check accuracy
5. **Test Replay**: Victory/Defeat → Play Again

---

## 🐛 Debug Console Commands

```javascript
// Access game instance (in console)
game.player.takeDamage(50)  // Damage player
game.player.heal(100)        // Heal player
game.waveManager.currentWave // Check wave number
game.stateManager.changeState('VICTORY') // Force victory
game.statsManager.stats      // View all stats
```

---

## 📝 Code Structure

```
src/
├── managers/
│   ├── GameStateManager.js   (State machine)
│   ├── WaveManager.js         (Wave spawning)
│   ├── StatsManager.js        (Stat tracking)
│   ├── SoundManager.js        (Audio)
│   └── MenuManager.js         (UI screens)
├── Game.js                    (Main integration)
├── Player.js                  (Health system)
└── Enemy.js                   (Collision damage)
```

---

## 🎬 Common Issues

### No Sound?
- Sound requires user interaction
- Click "START MISSION" to initialize audio

### Enemies Not Spawning?
- Check console for errors
- Verify WaveManager is initialized

### Menu Not Showing?
- Check index.html has all menu divs
- Verify style.css is loaded

### Health Not Decreasing?
- Enemy collision uses 2-unit radius
- Check Enemy.checkPlayerCollision() is called

---

## 🚢 Ready to Ship

Phase 8 is **complete and playable**!

✅ Full game loop  
✅ Menu system  
✅ 5-wave progression  
✅ Win/loss conditions  
✅ Statistics  
✅ Sound effects  
✅ Replayability  

**The game is ready for itch.io or further development!**
