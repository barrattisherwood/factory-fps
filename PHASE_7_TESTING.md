# PHASE 7 TESTING GUIDE

## 🧪 How to Test Phase 7 Features

### Prerequisites
1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Click to lock pointer and enter game

---

## ✅ Test Scenario 1: Basic Factory UI

**Objective**: Verify factory overlay opens and closes correctly

### Steps
1. Press **TAB** key
2. Factory overlay should appear
3. Verify you can see:
   - "ORBITAL RIG - PRODUCTION" header
   - Resources section (Metal/Energy)
   - Two production panels (Kinetic/Flux)
4. Press **TAB** again
5. Factory should close
6. Press **TAB** to open again
7. Press **ESC** key
8. Factory should close

### Expected Results
- ✅ Factory opens on TAB
- ✅ Factory closes on TAB
- ✅ Factory closes on ESC
- ✅ Game world visible through overlay
- ✅ UI is readable and centered

---

## ✅ Test Scenario 2: Time Scaling

**Objective**: Verify time slows when factory is open

### Steps
1. Start game and observe normal movement
2. Press **TAB** to open factory
3. Try moving with **WASD** keys
4. Observe enemy animations
5. Watch resource orbs if any are present
6. Close factory with **TAB**
7. Movement should return to normal speed

### Expected Results
- ✅ Movement slows to ~30% speed when factory open
- ✅ Enemies animate slowly
- ✅ Orbs float/move slowly
- ✅ Normal speed returns when closed
- ✅ Game feels slow but NOT paused

---

## ✅ Test Scenario 3: Shooting Disabled

**Objective**: Verify player cannot shoot while factory is open

### Steps
1. Open factory with **TAB**
2. Try clicking left mouse button
3. No shots should fire
4. Close factory with **TAB**
5. Click left mouse button
6. Shots should fire normally

### Expected Results
- ✅ Cannot shoot while factory open
- ✅ No muzzle flash or bullet tracers
- ✅ Can shoot normally when closed

---

## ✅ Test Scenario 4: Resource Collection & Display

**Objective**: Verify resource collection updates factory display

### Steps
1. Kill a **standard robot** (grey, no shield)
2. Collect the **orange orb** that drops
3. Open factory with **TAB**
4. Check **Metal** resource count
5. Should show increased metal (e.g., "Metal: 10")
6. Check **Kinetic Panel** stock
7. Should show increased kinetic ammo
8. Close factory

9. Kill a **shielded robot** (grey with blue shield)
10. Use **Flux ammo** (press **2** first) to break shield
11. Collect the **blue orb** that drops
12. Open factory with **TAB**
13. Check **Energy** resource count
14. Should show increased energy (e.g., "Energy: 10")
15. Check **Flux Panel** stock
16. Should show increased flux ammo

### Expected Results
- ✅ Metal count increases when orange orb collected
- ✅ Energy count increases when blue orb collected
- ✅ Kinetic ammo increases with metal
- ✅ Flux ammo increases with energy
- ✅ Progress bars update visually
- ✅ Counts match between factory UI and HUD

---

## ✅ Test Scenario 5: Production Status Indicators

**Objective**: Verify status messages change based on resource levels

### Steps
1. Start fresh game (low resources initially)
2. Open factory with **TAB**
3. Note status messages on both panels
4. Close factory
5. Kill several enemies and collect many orbs
6. Open factory again
7. Status messages should change to "Producing..."

### Expected Results
- ✅ "Low Resources" shown when < 10 resources
- ✅ "Producing..." shown when ≥ 10 resources
- ✅ Status updates in real-time
- ✅ Each panel tracks independently

---

## ✅ Test Scenario 6: Progress Bars

**Objective**: Verify visual progress bars update correctly

### Steps
1. Open factory with **TAB**
2. Note the initial bar fill levels:
   ```
   Metal:  10  [██░░░░░░░░]
   ```
3. Close factory
4. Collect 20 orange orbs (kill standard robots)
5. Open factory again
6. Progress bar should be more filled:
   ```
   Metal:  30  [████░░░░░░]
   ```

### Expected Results
- ✅ Bars show as block characters (█ and ░)
- ✅ Fill level increases with resource count
- ✅ Different colors for metal vs energy
- ✅ Smooth visual transition

---

## ✅ Test Scenario 7: Multi-Collection Update

**Objective**: Verify factory updates while open

### Steps
1. Kill an enemy near you (orb drops close)
2. Open factory with **TAB** immediately
3. Move slowly to collect the orb while factory is open
4. Observe resource count update in real-time
5. Observe production panel update
6. Ammo stock should increase

### Expected Results
- ✅ Factory display updates while open
- ✅ Resource count increments
- ✅ Ammo stock increments
- ✅ No need to close/reopen to see changes

---

## ✅ Test Scenario 8: Mid-Combat Usage

**Objective**: Test tactical factory usage during combat

### Steps
1. Engage multiple enemies
2. Get into active firefight
3. Press **TAB** to open factory mid-combat
4. Enemy bullets should still be moving (slowly)
5. Quickly check resource status
6. Press **TAB** to close
7. Resume combat at full speed

### Expected Results
- ✅ Time slows but doesn't pause
- ✅ Can see enemies still moving
- ✅ Can dodge slowly if needed
- ✅ Quick status check is feasible
- ✅ Closing returns to action immediately

---

## ✅ Test Scenario 9: HUD Integration

**Objective**: Verify HUD hint and factory integration

### Steps
1. Look at bottom of ammo HUD (top-right corner)
2. Should see: "Press 1/2 to switch ammo    [TAB] Factory Status"
3. Press **TAB** to open factory
4. Ammo counts in factory should match HUD
5. Close factory
6. Switch ammo with **1** or **2**
7. Open factory again
8. Active ammo type should be highlighted

### Expected Results
- ✅ HUD shows factory hint
- ✅ Factory ammo counts match HUD
- ✅ Switching ammo reflected in factory
- ✅ Clear visual consistency

---

## ✅ Test Scenario 10: Low Resource Warning

**Objective**: Verify warning state when resources are low

### Steps
1. Start fresh game (should have < 10 resources)
2. Open factory with **TAB**
3. Check status on both panels
4. Should show "Low Resources" warning
5. Warning text should be visible (yellow/alert color)

### Expected Results
- ✅ "Low Resources" shown when metal < 10
- ✅ "Low Resources" shown when energy < 10
- ✅ Visual distinction from normal state
- ✅ Teaches player to collect more

---

## 🐛 Known Issues to Watch For

### Not Bugs (Working As Intended)
- ✅ Factory doesn't pause game (by design)
- ✅ Can't shoot while factory open (tactical limitation)
- ✅ Time scale affects everything (consistent behavior)

### Potential Issues
- ❌ Factory doesn't open: Check TAB key binding
- ❌ Resource count doesn't update: Check event bus wiring
- ❌ Time doesn't slow: Check Game.setTimeScale() call
- ❌ Ammo doesn't increase: Check ResourceManager → AmmoManager link

---

## 📊 Testing Checklist

Use this checklist to verify all features:

- [ ] Factory opens with TAB
- [ ] Factory closes with TAB
- [ ] Factory closes with ESC
- [ ] Time slows to 30% when open
- [ ] Time returns to 100% when closed
- [ ] Player movement slowed appropriately
- [ ] Enemy animations slowed appropriately
- [ ] Shooting disabled while factory open
- [ ] Shooting works when factory closed
- [ ] Metal resource count updates
- [ ] Energy resource count updates
- [ ] Kinetic ammo stock shown correctly
- [ ] Flux ammo stock shown correctly
- [ ] Progress bars render correctly
- [ ] Progress bars update with resources
- [ ] "Low Resources" warning appears < 10
- [ ] "Producing..." status appears ≥ 10
- [ ] Factory UI readable and clear
- [ ] Game world visible through overlay
- [ ] HUD shows factory hint
- [ ] No console errors
- [ ] No visual glitches
- [ ] Performance is smooth

---

## 🎯 Success Criteria

Phase 7 is successful if:

1. **UI Functions**
   - Factory opens/closes reliably
   - Display is clear and readable
   - No visual bugs or overlaps

2. **Time Scaling Works**
   - Movement slows noticeably
   - Animations scale correctly
   - Returns to normal smoothly

3. **Production Pipeline**
   - Resources route to ammo correctly
   - Counts update in real-time
   - No desync between systems

4. **Player Understanding**
   - New player can open factory
   - Resource → ammo connection is clear
   - Status indicators make sense

5. **Tactical Usage**
   - Can check status mid-combat
   - Risk/reward feels balanced
   - Not a "free pause" button

---

## 🔍 Debug Commands

Open browser console (F12) to see debug output:

```javascript
// Check resource manager state
console.log(game.resourceManager.getAll());

// Check ammo manager state
console.log(game.ammoManager.getAll());

// Check time scale
console.log(game.timeScale);

// Check factory UI state
console.log(game.factoryUI.isOpen);
```

---

## 📝 Report Template

If you find issues, report with this format:

```
**Issue**: [Brief description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Browser**: [Chrome/Firefox/etc]
**Console Errors**: [Any errors in console]
```

---

## ✅ Final Verification

Before marking Phase 7 complete:

1. Run through ALL test scenarios
2. Verify ALL checklist items
3. Test in at least 2 different browsers
4. Play for 5+ minutes continuously
5. Check console for any errors
6. Verify no performance degradation

**If all tests pass, Phase 7 is COMPLETE!** 🎉

---

**Ready to test? Start with Scenario 1 and work through sequentially!**
