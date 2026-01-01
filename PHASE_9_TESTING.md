# PHASE 9 TESTING GUIDE

## Manual Testing Checklist

### 🎮 Core Gameplay Loop

#### Starting a Run
- [ ] Main menu loads correctly
- [ ] "Start Run" button visible in hub
- [ ] Clicking "Start Run" initializes game
- [ ] Player spawns at origin
- [ ] HUD displays correctly
- [ ] Resources start at 0
- [ ] Ammo starts at initial values

#### Level 1 (8 Enemies)
- [ ] 8 enemies spawn in circle around player
- [ ] Enemy composition: 5 standard, 3 shielded
- [ ] All enemies visible
- [ ] Enemies move toward player
- [ ] Player can shoot enemies
- [ ] Enemies drop orbs on death
- [ ] Kill counter updates
- [ ] Level transition triggers when all dead

#### Level Transition
- [ ] Level transition screen appears
- [ ] Shows "LEVEL 1 COMPLETE"
- [ ] Displays rewards (50 metal, 30 energy)
- [ ] Resources update in HUD
- [ ] 3-second countdown
- [ ] Auto-starts next level

#### Level 2 (10 Enemies)
- [ ] 10 enemies spawn
- [ ] Composition: 4 standard, 4 shielded, 2 heavy
- [ ] Heavy enemies render (if implemented)
- [ ] Difficulty feels appropriate
- [ ] Rewards given (75 metal, 50 energy)

#### Level 3 (14 Enemies)
- [ ] 14 enemies spawn
- [ ] Composition: 4 standard, 6 shielded, 4 heavy
- [ ] Most challenging pre-boss level
- [ ] Rewards given (100 metal, 75 energy)

#### Boss Fight
- [ ] Boss transition screen shows
- [ ] "BOSS ENCOUNTER" displayed
- [ ] 3-second preparation time
- [ ] Flux Warden spawns at z: -50
- [ ] Boss is 2x larger than normal enemies
- [ ] Boss has orange color (0xff4400)
- [ ] Boss health bar appears at top
- [ ] Health bar updates as boss takes damage
- [ ] Boss moves toward player
- [ ] Boss collisions deal damage

#### Boss Defeat
- [ ] Boss explodes on death
- [ ] Orbs drop from boss
- [ ] Unlock notification appears
- [ ] "Thermal Panel Blueprint" displayed
- [ ] Notification fades after 3 seconds
- [ ] 2-second delay before success screen

#### Run Success
- [ ] Success screen appears
- [ ] Shows "RUN COMPLETE!"
- [ ] Displays run statistics
- [ ] "Return to Hub" button works
- [ ] "Play Again" button restarts run
- [ ] Persistent stats update

### 🏠 Hub Screen

#### Hub Display
- [ ] Hub appears after success/failed
- [ ] Shows persistent stats
- [ ] Stats update after each run
- [ ] Displays unlocked blueprints
- [ ] Blueprint cards render correctly
- [ ] Stats are accurate

#### Hub Buttons
- [ ] "Start New Run" works
- [ ] "View Unlocks" shows list
- [ ] "View Stats" shows details
- [ ] "Reset Progress" prompts confirm
- [ ] Reset clears localStorage

### ☠️ Run Failure

#### Player Death
- [ ] Player death during level triggers run failed
- [ ] Enemies despawn
- [ ] Run failed screen appears
- [ ] Shows level reached
- [ ] Shows enemies killed
- [ ] "Return to Hub" works
- [ ] "Try Again" restarts run

### 💾 Persistence

#### localStorage
- [ ] Unlocks save correctly
- [ ] Stats save correctly
- [ ] Close tab, reopen: unlocks persist
- [ ] Close tab, reopen: stats persist
- [ ] Reset progress clears storage

#### Unlock System
- [ ] First boss defeat unlocks thermal blueprint
- [ ] Subsequent boss defeats don't duplicate
- [ ] Unlocks show in hub
- [ ] Unlocks persist across sessions

#### Stats Tracking
- [ ] Runs attempted increments each start
- [ ] Runs completed increments on success
- [ ] Bosses defeated increments on boss kill
- [ ] Total enemies killed accumulates
- [ ] Best run time tracks fastest completion

### 🎨 UI/UX

#### Visual Feedback
- [ ] Boss health bar smooth animation
- [ ] Unlock notification slides in
- [ ] Level transitions fade properly
- [ ] Button hover states work
- [ ] Text is readable
- [ ] Colors are appropriate

#### Responsiveness
- [ ] UI scales on window resize
- [ ] All screens fit viewport
- [ ] No overflow issues
- [ ] Mobile view works (if supported)

#### Accessibility
- [ ] Text contrast is sufficient
- [ ] Font sizes are readable
- [ ] Button targets are large enough
- [ ] Keyboard navigation works (ESC, Enter)

### 🔊 Audio (If Implemented)

- [ ] Boss spawn sound plays
- [ ] Boss defeat sound plays
- [ ] Unlock notification sound plays
- [ ] Level complete sound plays
- [ ] Run failed sound plays

### ⚙️ Technical

#### Performance
- [ ] 60 FPS maintained during gameplay
- [ ] Boss doesn't cause frame drops
- [ ] Many enemies don't lag
- [ ] UI updates are smooth

#### Errors
- [ ] Console has no errors
- [ ] No 404s in network tab
- [ ] localStorage operations don't fail
- [ ] State transitions are clean

#### Edge Cases
- [ ] Pause during boss fight works
- [ ] Quit to hub from level works
- [ ] Multiple rapid restarts work
- [ ] Boss defeat before notification complete
- [ ] Player death on same frame as boss death

### 🐛 Known Issues to Verify

1. **Boss AI**: 
   - [ ] Boss uses basic enemy movement (expected)
   - [ ] Boss doesn't get stuck
   - [ ] Boss pathfinding works

2. **Heavy Enemy**:
   - [ ] Heavy enemy placeholder in configs
   - [ ] Falls back to standard if not implemented
   - [ ] Doesn't crash game

3. **Thermal Ammo**:
   - [ ] Blueprint drops but not functional (expected)
   - [ ] Doesn't cause errors
   - [ ] Shows as unlocked in hub

4. **Level Completion Check**:
   - [ ] Works when all enemies killed
   - [ ] Doesn't trigger prematurely
   - [ ] Boss death triggers properly

5. **State Management**:
   - [ ] No state conflicts
   - [ ] Transitions are atomic
   - [ ] Can't spam button to break states

## Console Testing Commands

```javascript
// Start run
window.game.startRun()

// Check current state
window.game.stateManager.currentState

// Check current run
window.game.runManager.currentRun

// Check unlocks
window.game.unlockManager.getAllUnlocks()

// Check stats
window.game.persistentStats.getAllStats()

// Manually unlock blueprint
window.game.unlockManager.unlock('thermal_panel_blueprint')

// Kill all enemies (testing)
window.game.enemies.forEach(e => e.takeDamage(1000))

// Quit to hub
window.game.quitToHub()

// Reset all progress
window.game.resetProgress()

// Check localStorage
localStorage.getItem('fps_factory_unlocks')
localStorage.getItem('fps_factory_persistent_stats')
```

## Regression Testing (Phase 8)

#### Wave Mode Still Works
- [ ] Main menu has "Play" button
- [ ] Wave mode starts correctly
- [ ] Waves progress normally
- [ ] Victory screen at wave 12
- [ ] Defeat screen on death
- [ ] No Phase 9 interference

## Browser Compatibility

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing (Optional)

- [ ] Touch controls work
- [ ] UI is readable on small screen
- [ ] Performance is acceptable
- [ ] No mobile-specific bugs

## Automated Testing Suggestions

```javascript
// Unit test examples:
describe('RunManager', () => {
  it('should start new run', () => {
    runManager.startNewRun();
    expect(runManager.currentRun).toBeDefined();
  });
  
  it('should track level progression', () => {
    runManager.startNewRun();
    expect(runManager.currentRun.currentLevel).toBe(1);
  });
});

describe('UnlockManager', () => {
  it('should unlock blueprints', () => {
    unlockManager.unlock('thermal_panel_blueprint');
    expect(unlockManager.isUnlocked('thermal_panel_blueprint')).toBe(true);
  });
  
  it('should persist to localStorage', () => {
    unlockManager.unlock('thermal_panel_blueprint');
    expect(localStorage.getItem('fps_factory_unlocks')).toContain('thermal_panel_blueprint');
  });
});
```

## Sign-Off

### Day 1-4 Testing
- [ ] All core systems functional
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for Day 5-7 polish

**Tester**: _________________  
**Date**: _________________  
**Build**: Phase 9 Day 1-4  
**Status**: ⏳ Pending / ✅ Passed / ❌ Failed

---
*Testing guide for Phase 9 Roguelike Structure*
