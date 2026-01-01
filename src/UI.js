export class UI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.ammoDisplay = null;
    this.kineticAmmoText = null;
    this.fluxAmmoText = null;
    this.thermalAmmoText = null;  // Phase 9
    this.currentAmmoType = 'kinetic';
    this.ammoAmounts = { kinetic: 50, flux: 20, thermal: 0 }; // Phase 9: thermal instead of caustic
    this.crosshair = null;
    this.victoryScreen = null;

    this.createUI();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for ammo state first (initial load)
    this.eventBus.on('ammo:state', (data) => {
      this.currentAmmoType = data.current;
      this.ammoAmounts = data.amounts;
      this.updateAmmoDisplay();
      console.log('UI: Initial ammo state loaded', data.amounts);
    });

    // Listen for ammo changes via EventBus (decoupled!)
    this.eventBus.on('ammo:changed', (data) => {
      console.log(`UI received ammo:changed - ${data.type}: ${data.amount}`);
      this.ammoAmounts[data.type] = data.amount;
      this.updateAmmoDisplay();
    });

    // Listen for ammo switching
    this.eventBus.on('ammo:switched', (data) => {
      this.currentAmmoType = data.type;
      this.ammoAmounts[data.type] = data.amount;
      this.updateAmmoDisplay();
      console.log(`UI: Switched to ${data.type}`);
    });

    // Listen for empty ammo
    this.eventBus.on('ammo:empty', (data) => {
      this.flashAmmoDisplay();
    });

    // Listen for resource changes (for later resource display)
    this.eventBus.on('resource:changed', (data) => {
      console.log(`UI: ${data.type} changed to ${data.amount}`);
    });
  }

  createUI() {
    // Create ammo display container
    this.ammoDisplay = document.createElement('div');
    this.ammoDisplay.id = 'ammo-display';
    this.ammoDisplay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      font-family: 'Courier New', monospace;
      z-index: 100;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 15px 20px;
      border: 2px solid #444;
      border-radius: 5px;
    `;

    // Kinetic ammo line
    this.kineticAmmoText = document.createElement('div');
    this.kineticAmmoText.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      color: #ff6600;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(255, 102, 0, 0.6);
      transition: all 0.2s;
    `;
    this.ammoDisplay.appendChild(this.kineticAmmoText);

    // Flux ammo line
    this.fluxAmmoText = document.createElement('div');
    this.fluxAmmoText.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      color: #00aaff;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(0, 170, 255, 0.6);
      transition: all 0.2s;
    `;
    this.ammoDisplay.appendChild(this.fluxAmmoText);

    // Thermal ammo line (Phase 9)
    this.thermalAmmoText = document.createElement('div');
    this.thermalAmmoText.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      color: #ff3300;
      text-shadow: 0 0 10px rgba(255, 51, 0, 0.6);
      transition: all 0.2s;
      display: none;  /* Hidden until unlocked */
    `;
    this.ammoDisplay.appendChild(this.thermalAmmoText);

    // Help text
    const helpText = document.createElement('div');
    helpText.style.cssText = `
      font-size: 12px;
      color: #888;
      margin-top: 8px;
      border-top: 1px solid #444;
      padding-top: 8px;
    `;
    helpText.textContent = 'Press 1/2/3 to switch ammo    [TAB] Factory Status';
    this.ammoDisplay.appendChild(helpText);

    document.body.appendChild(this.ammoDisplay);

    // Crosshair
    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.crosshair.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      margin-top: -10px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 50;
    `;
    document.body.appendChild(this.crosshair);

    // Add center dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      margin-left: -2px;
      margin-top: -2px;
    `;
    this.crosshair.appendChild(dot);

    // Remove default page styling
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    // Initial update
    this.updateAmmoDisplay();
  }

  updateAmmoDisplay() {
    // Kinetic line with active indicator
    const kineticActive = this.currentAmmoType === 'kinetic' ? ' [ACTIVE]' : '';
    this.kineticAmmoText.textContent = `KINETIC: ${this.ammoAmounts.kinetic}${kineticActive}`;
    
    // Flux line
    const fluxActive = this.currentAmmoType === 'flux' ? ' [ACTIVE]' : '';
    this.fluxAmmoText.textContent = `FLUX: ${this.ammoAmounts.flux}${fluxActive}`;
    
    // Thermal line (Phase 9 - show if unlocked)
    if (this.ammoAmounts.thermal !== undefined) {
      const thermalActive = this.currentAmmoType === 'thermal' ? ' [ACTIVE]' : '';
      this.thermalAmmoText.textContent = `THERMAL: ${this.ammoAmounts.thermal}${thermalActive}`;
      
      // Show thermal display if any ammo exists or if it's been unlocked
      if (this.ammoAmounts.thermal > 0 || window.game?.unlockManager?.isUnlocked('thermal_panel_blueprint')) {
        this.thermalAmmoText.style.display = 'block';
      }
    }

    // Scale up active ammo type for visibility
    this.kineticAmmoText.style.fontSize = this.currentAmmoType === 'kinetic' ? '22px' : '18px';
    this.fluxAmmoText.style.fontSize = this.currentAmmoType === 'flux' ? '22px' : '18px';
    if (this.thermalAmmoText) {
      this.thermalAmmoText.style.fontSize = this.currentAmmoType === 'thermal' ? '22px' : '18px';
    }
    
    // Low ammo warnings
    this.updateLowAmmoWarnings();
    this.updateFactoryHint();
  }
  
  updateLowAmmoWarnings() {
    // Low ammo visual feedback
    const ammoElements = [
      { el: this.kineticAmmoText, type: 'kinetic', amount: this.ammoAmounts.kinetic },
      { el: this.fluxAmmoText, type: 'flux', amount: this.ammoAmounts.flux },
      { el: this.thermalAmmoText, type: 'thermal', amount: this.ammoAmounts.thermal }
    ];
    
    ammoElements.forEach(({ el, type, amount }) => {
      if (!el) return;
      
      // Remove all warning classes first
      el.classList.remove('low-ammo', 'empty-ammo');
      el.style.animation = '';
      
      if (amount === 0) {
        el.classList.add('empty-ammo');
        el.style.opacity = '0.5';
      } else if (amount < 20 && amount > 0) {
        el.classList.add('low-ammo');
        el.style.animation = 'low-ammo-pulse 1s infinite';
      } else {
        el.style.opacity = '1';
      }
    });
  }
  
  updateFactoryHint() {
    // Show factory hint if low on active ammo
    const activeAmount = this.ammoAmounts[this.currentAmmoType];
    
    if (activeAmount < 20 && activeAmount > 0) {
      this.showFactoryHint();
    } else {
      this.hideFactoryHint();
    }
  }
  
  showFactoryHint() {
    let hint = document.getElementById('factory-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'factory-hint';
      hint.className = 'factory-hint-popup';
      hint.innerHTML = `
        <span class="hint-icon">⚠️</span>
        <span class="hint-text">LOW AMMO - Press TAB to convert resources</span>
      `;
      hint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 200, 0, 0.95);
        color: #000;
        padding: 15px 30px;
        border: 2px solid #ff6600;
        font-size: 18px;
        font-weight: bold;
        z-index: 500;
        animation: hint-pulse 1.5s infinite;
        font-family: 'Courier New', monospace;
        border-radius: 5px;
        text-align: center;
      `;
      document.body.appendChild(hint);
      
      // Add animations to document if not already present
      if (!document.getElementById('ammo-warning-styles')) {
        const style = document.createElement('style');
        style.id = 'ammo-warning-styles';
        style.textContent = `
          @keyframes low-ammo-pulse {
            0%, 100% { box-shadow: 0 0 10px rgba(255, 200, 0, 0.5); }
            50% { box-shadow: 0 0 20px rgba(255, 200, 0, 0.8); }
          }
          @keyframes hint-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .hint-icon {
            font-size: 24px;
            margin-right: 10px;
          }
        `;
        document.head.appendChild(style);
      }
    }
    hint.style.display = 'block';
  }
  
  hideFactoryHint() {
    const hint = document.getElementById('factory-hint');
    if (hint) {
      hint.style.display = 'none';
    }
  }

  flashAmmoDisplay() {
    // Flash red when out of ammo
    const originalDisplay = this.ammoDisplay.style.borderColor;
    this.ammoDisplay.style.borderColor = '#ff0000';
    this.ammoDisplay.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.6)';
    
    setTimeout(() => {
      this.ammoDisplay.style.borderColor = originalDisplay;
      this.ammoDisplay.style.boxShadow = 'none';
    }, 200);
  }

  showVictory() {
    this.victoryScreen = document.createElement('div');
    this.victoryScreen.id = 'victory-screen';
    this.victoryScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 200;
    `;

    const victoryText = document.createElement('h1');
    victoryText.textContent = 'SECTOR CLEARED';
    victoryText.style.cssText = `
      font-size: 72px;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      margin: 0 0 30px 0;
      text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
    `;
    this.victoryScreen.appendChild(victoryText);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART';
    restartButton.style.cssText = `
      padding: 15px 40px;
      font-size: 24px;
      background-color: #ff9900;
      color: #000;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      transition: all 0.2s;
    `;
    restartButton.onmouseover = () => {
      restartButton.style.backgroundColor = '#ffaa00';
      restartButton.style.boxShadow = '0 0 15px rgba(255, 153, 0, 0.8)';
    };
    restartButton.onmouseout = () => {
      restartButton.style.backgroundColor = '#ff9900';
      restartButton.style.boxShadow = 'none';
    };
    restartButton.onclick = () => location.reload();
    this.victoryScreen.appendChild(restartButton);

    document.body.appendChild(this.victoryScreen);
  }
}
