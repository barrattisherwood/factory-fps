# PHASE 9 QUICK REFERENCE

## Starting a Run

```javascript
game.startRun();
// Resets player, resources, ammo
// Starts RunManager.startNewRun()
// Spawns Level 1 (8 enemies)
// Changes state to PLAYING
```

## Level Structure

```javascript
Level 1: 8 enemies  → 50 metal, 30 energy reward
Level 2: 10 enemies → 75 metal, 50 energy reward
Level 3: 14 enemies → 100 metal, 75 energy reward
Boss: Flux Warden  → thermal_panel_blueprint
```

## Key Methods

### Game.js
```javascript
game.startRun()           // Begin new run
game.loadBossFight()      // Spawn boss after level 3
game.quitToHub()          // Return to hub
game.restartRun()         // Retry current run
game.resetProgress()      // Clear all unlocks/stats
```

### RunManager
```javascript
runManager.startNewRun()        // Initialize run
runManager.startNextLevel()     // Progress to next level
runManager.spawnCurrentLevel()  // Spawn level enemies
runManager.onLevelComplete()    // Handle level completion
runManager.onRunSuccess()       // Run completed
runManager.onRunFailed()        // Player died
```

### UnlockManager
```javascript
unlockManager.unlock('thermal_panel_blueprint')
unlockManager.isUnlocked('thermal_panel_blueprint')
unlockManager.getAllUnlocks()
unlockManager.reset()
```

### PersistentStats
```javascript
persistentStats.onRunStarted()
persistentStats.onRunCompleted(runTime)
persistentStats.onBossDefeated()
persistentStats.onEnemyKilled()
persistentStats.getAllStats()
```

## Events

### Phase 9 Events
```javascript
'run:started'      → { runId, startTime }
'run:success'      → { runId, endTime, result }
'run:failed'       → { runId, endTime, levelsCompleted }
'boss:defeated'    → { name }
'level:started'    → { level, total, config }
'level:completed'  → { level, rewards }
```

### Legacy Events (Phase 8)
```javascript
'enemy:killed'     → { type, position }
'player:died'      → {}
'resource:changed' → { type, amount }
'weapon:fired'     → { type }
'wave:started'     → { wave, label }
'wave:completed'   → { wave }
```

## States

```javascript
'HUB'              // Hub screen
'PLAYING'          // Normal gameplay (levels)
'LEVEL_TRANSITION' // Between levels
'BOSS_FIGHT'       // Boss encounter
'RUN_SUCCESS'      // Run completed
'RUN_FAILED'       // Player died
```

## localStorage

```javascript
'fps_factory_unlocks'          // { thermal_panel_blueprint: { unlocked: true } }
'fps_factory_persistent_stats' // { runsAttempted: 5, runsCompleted: 2, ... }
```

## Boss Configuration

```javascript
BOSS_CONFIG.flux_warden = {
  name: 'Flux Warden',
  health: 500,
  speed: 0.8,
  damage: 15,
  color: 0xff4400,
  scale: 2.0,
  unlockDrop: 'thermal_panel_blueprint'
}
```

## UI Screens

```html
#hub-screen           <!-- Central hub -->
#level-transition     <!-- Level info -->
#run-success-screen   <!-- Victory -->
#run-failed-screen    <!-- Defeat -->
#boss-health-bar      <!-- Boss HP (dynamic) -->
#unlock-notification  <!-- Unlock popup (dynamic) -->
```

## Testing Commands

```javascript
// Start run from console
window.game.startRun()

// Check current run
window.game.runManager.currentRun

// Check unlocks
window.game.unlockManager.getAllUnlocks()

// Check stats
window.game.persistentStats.getAllStats()

// Reset progress
window.game.resetProgress()

// Quit to hub
window.game.quitToHub()
```

## Common Patterns

### Check if in roguelike mode:
```javascript
if (this.runManager.currentRun) {
  // Phase 9: Run-based
} else {
  // Phase 8: Wave-based
}
```

### Access game from Boss:
```javascript
const game = window.game;
game.unlockManager.unlock(this.unlockDrop);
```

### Level completion check:
```javascript
if (this.enemies.length === 0 && this.runManager.currentRun) {
  this.runManager.onLevelComplete();
}
```

## File Organization

```
src/
  Boss.js                      ← Boss enemy class
  Game.js                      ← Main game controller (updated)
  managers/
    RunManager.js              ← Run structure & levels
    UnlockManager.js           ← Persistent unlocks
    PersistentStats.js         ← Career statistics
    GameStateManager.js        ← State machine (updated)
    MenuManager.js             ← UI screens (rewritten)
```

## Next to Implement

1. **Heavy Enemy**: Add to `src/config/enemies.js`
2. **Thermal Ammo**: Add to `src/config/ammo.js`
3. **Boss Patterns**: Improve Boss.js attack logic
4. **UI Polish**: Animations, sounds, visual feedback

---
*Quick Reference for Phase 9 Development*
