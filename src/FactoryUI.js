import './style.css';

export class FactoryUI {
  constructor(eventBus, game) {
    this.eventBus = eventBus;
    this.game = game;
    this.isOpen = false;
    
    // Access managers through game instance
    this.resourceManager = null;
    this.ammoManager = null;
    this.unlockManager = null;

    this.createOverlay();
    this.setupEventListeners();
    this.bindKeys();
  }
  
  setManagers(resourceManager, ammoManager, unlockManager) {
    this.resourceManager = resourceManager;
    this.ammoManager = ammoManager;
    this.unlockManager = unlockManager;
  }

  bindKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.game.stateManager && this.game.stateManager.currentState === 'PLAYING') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        if (this.isOpen) this.toggle();
      }
    });
  }

  createOverlay() {
    // Semi-transparent full-screen backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.id = 'factory-overlay';
    Object.assign(this.backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'none',
      zIndex: 300,
      fontFamily: "'Courier New', monospace",
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Center container
    this.container = document.createElement('div');
    this.container.className = 'factory-container';
    Object.assign(this.container.style, {
      background: 'rgba(0, 20, 40, 0.95)',
      border: '3px solid #00ffcc',
      padding: '30px',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto',
      borderRadius: '10px'
    });

    // Header
    const header = document.createElement('h1');
    header.textContent = 'ORBITAL RIG - FABRICATION';
    Object.assign(header.style, {
      fontSize: '28px',
      textAlign: 'center',
      margin: '0 0 10px 0',
      color: '#00ffcc',
      textTransform: 'uppercase'
    });
    this.container.appendChild(header);
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'factory-subtitle';
    subtitle.textContent = 'Manual resource conversion';
    Object.assign(subtitle.style, {
      color: '#888',
      fontSize: '14px',
      margin: '-10px 0 20px 0',
      textAlign: 'center'
    });
    this.container.appendChild(subtitle);

    // Create panels
    this.kineticPanel = this.createConversionPanel('kinetic', 'metal', 'KINETIC FABRICATOR', '#ff6600');
    this.container.appendChild(this.kineticPanel);
    
    this.fluxPanel = this.createConversionPanel('flux', 'energy', 'FLUX FABRICATOR', '#00aaff');
    this.container.appendChild(this.fluxPanel);
    
    this.thermalPanel = this.createConversionPanel('thermal', 'thermal_core', 'THERMAL FABRICATOR', '#ff3300');
    this.thermalPanel.classList.add('locked');
    this.container.appendChild(this.thermalPanel);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'factory-footer';
    Object.assign(footer.style, {
      textAlign: 'center',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #333'
    });
    
    const hint = document.createElement('p');
    hint.className = 'factory-hint';
    hint.textContent = 'Press TAB to close • Conversion ratio: 1:1';
    Object.assign(hint.style, {
      color: '#666',
      fontSize: '14px',
      margin: 0
    });
    footer.appendChild(hint);
    
    this.container.appendChild(footer);
    this.backdrop.appendChild(this.container);
    document.body.appendChild(this.backdrop);
  }

  createConversionPanel(ammoType, resourceType, title, color) {
    const panel = document.createElement('div');
    panel.className = 'factory-panel';
    panel.id = `panel-${ammoType}`;
    Object.assign(panel.style, {
      background: 'rgba(0, 30, 50, 0.8)',
      border: `2px solid ${color}`,
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '5px'
    });

    // Title
    const panelTitle = document.createElement('h3');
    panelTitle.className = 'panel-title';
    panelTitle.textContent = title;
    Object.assign(panelTitle.style, {
      color: color,
      fontSize: '20px',
      margin: '0 0 15px 0',
      textTransform: 'uppercase'
    });
    panel.appendChild(panelTitle);

    // Content container
    const content = document.createElement('div');
    content.className = 'panel-content';
    Object.assign(content.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });

    // Resource display
    const resourceDisplay = document.createElement('div');
    resourceDisplay.className = 'resource-display';
    Object.assign(resourceDisplay.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderLeft: `3px solid ${color}`
    });

    const resourceLabel = document.createElement('span');
    resourceLabel.className = 'resource-label';
    resourceLabel.textContent = `${this.getResourceName(resourceType)} Stored:`;
    Object.assign(resourceLabel.style, {
      color: '#888',
      flex: '1'
    });
    resourceDisplay.appendChild(resourceLabel);

    const resourceValue = document.createElement('span');
    resourceValue.className = 'resource-value';
    resourceValue.id = `${resourceType}-stored`;
    resourceValue.textContent = '0';
    Object.assign(resourceValue.style, {
      color: color,
      fontSize: '24px',
      fontWeight: 'bold',
      minWidth: '60px',
      textAlign: 'right'
    });
    resourceDisplay.appendChild(resourceValue);

    const resourceUnit = document.createElement('span');
    resourceUnit.className = 'resource-unit';
    resourceUnit.textContent = 'units';
    Object.assign(resourceUnit.style, {
      color: '#666',
      fontSize: '14px'
    });
    resourceDisplay.appendChild(resourceUnit);

    content.appendChild(resourceDisplay);

    // Ammo display
    const ammoDisplay = document.createElement('div');
    ammoDisplay.className = 'ammo-display';
    Object.assign(ammoDisplay.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderLeft: `3px solid ${color}`
    });

    const ammoLabel = document.createElement('span');
    ammoLabel.className = 'ammo-label';
    ammoLabel.textContent = `${this.getAmmoName(ammoType)} Ammo:`;
    Object.assign(ammoLabel.style, {
      color: '#888',
      flex: '1'
    });
    ammoDisplay.appendChild(ammoLabel);

    const ammoCurrent = document.createElement('span');
    ammoCurrent.className = 'ammo-value';
    ammoCurrent.id = `${ammoType}-current`;
    ammoCurrent.textContent = '50';
    Object.assign(ammoCurrent.style, {
      color: color,
      fontSize: '24px',
      fontWeight: 'bold',
      minWidth: '60px',
      textAlign: 'right'
    });
    ammoDisplay.appendChild(ammoCurrent);

    const ammoMax = document.createElement('span');
    ammoMax.className = 'ammo-max';
    ammoMax.textContent = ` / ${this.getMaxAmmo(ammoType)}`;
    Object.assign(ammoMax.style, {
      color: '#666',
      fontSize: '14px'
    });
    ammoDisplay.appendChild(ammoMax);

    content.appendChild(ammoDisplay);

    // Convert button
    const convertBtn = document.createElement('button');
    convertBtn.className = 'convert-btn';
    convertBtn.id = `btn-convert-${ammoType}`;
    convertBtn.textContent = ammoType === 'thermal' ? '🔒 LOCKED - Defeat Boss' : `Convert All ${this.getResourceName(resourceType)} → ${this.getAmmoName(ammoType)}`;
    Object.assign(convertBtn.style, {
      padding: '15px',
      fontSize: '16px',
      fontFamily: "'Courier New', monospace",
      background: color,
      color: '#000',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      borderRadius: '3px'
    });
    
    if (ammoType === 'thermal') {
      convertBtn.disabled = true;
      convertBtn.style.background = '#333';
      convertBtn.style.color = '#666';
      convertBtn.style.cursor = 'not-allowed';
    }
    
    content.appendChild(convertBtn);
    panel.appendChild(content);

    return panel;
  }

  getResourceName(type) {
    const names = {
      'metal': 'Metal',
      'energy': 'Energy',
      'thermal_core': 'Cores'
    };
    return names[type] || type;
  }

  getAmmoName(type) {
    const names = {
      'kinetic': 'Kinetic',
      'flux': 'Flux',
      'thermal': 'Thermal'
    };
    return names[type] || type;
  }

  getMaxAmmo(type) {
    const maxAmmos = {
      'kinetic': 300,
      'flux': 200,
      'thermal': 200
    };
    return maxAmmos[type] || 100;
  }

  setupEventListeners() {
    // Conversion button handlers
    document.getElementById('btn-convert-kinetic').addEventListener('click', () => {
      this.convertResources('metal', 'kinetic');
    });

    document.getElementById('btn-convert-flux').addEventListener('click', () => {
      this.convertResources('energy', 'flux');
    });

    document.getElementById('btn-convert-thermal').addEventListener('click', () => {
      this.convertResources('thermal_core', 'thermal');
    });

    // Update on resource/ammo changes
    this.eventBus.on('resource:changed', () => this.updateDisplay());
    this.eventBus.on('resource:converted', () => this.updateDisplay());
    this.eventBus.on('ammo:changed', () => this.updateDisplay());
    this.eventBus.on('unlock:acquired', () => this.updateDisplay());
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const overlay = document.getElementById('factory-overlay');

    if (this.isOpen) {
      overlay.style.display = 'flex';
      if (this.game.setTimeScale) {
        this.game.setTimeScale(0.3); // Slow time
      }
      // Unlock pointer so mouse is visible
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      this.updateDisplay();
    } else {
      overlay.style.display = 'none';
      if (this.game.setTimeScale) {
        this.game.setTimeScale(1.0); // Resume time
      }
      // Re-lock pointer for FPS controls
      if (this.game.player && this.game.player.controls) {
        this.game.player.controls.lock();
      }
    }
  }

  convertResources(resourceType, ammoType) {
    if (!this.resourceManager || !this.ammoManager) {
      console.error('Managers not set');
      return;
    }

    const available = this.resourceManager.get(resourceType);

    if (available === 0) {
      this.showMessage('No resources available', 'warning');
      return;
    }

    const success = this.resourceManager.convertAll(resourceType);

    if (success) {
      this.showMessage(`Converted ${available} ${resourceType} → ${available} ${ammoType}`, 'success');
      // Play conversion sound
      if (this.game.soundManager && this.game.soundManager.playConversion) {
        this.game.soundManager.playConversion();
      }
      this.updateDisplay();
    } else {
      this.showMessage('Conversion failed', 'error');
    }
  }

  updateDisplay() {
    if (!this.isOpen || !this.resourceManager || !this.ammoManager) return;

    // Update resource counts
    document.getElementById('metal-stored').textContent = this.resourceManager.get('metal');
    document.getElementById('energy-stored').textContent = this.resourceManager.get('energy');
    document.getElementById('thermal-stored').textContent = this.resourceManager.get('thermal_core');

    // Update ammo counts
    document.getElementById('kinetic-current').textContent = this.ammoManager.getAmount('kinetic');
    document.getElementById('flux-current').textContent = this.ammoManager.getAmount('flux');
    document.getElementById('thermal-current').textContent = this.ammoManager.getAmount('thermal');

    // Update button states
    this.updateButtonStates();

    // Update thermal panel locked state
    const thermalPanel = document.getElementById('panel-thermal');
    const thermalBtn = document.getElementById('btn-convert-thermal');

    if (this.unlockManager && this.unlockManager.isUnlocked('thermal_panel_blueprint')) {
      thermalPanel.classList.remove('locked');
      thermalPanel.style.opacity = '1';
      thermalPanel.style.borderColor = '#ff3300';
      thermalBtn.disabled = false;
      thermalBtn.textContent = 'Convert All Cores → Thermal';
      thermalBtn.style.background = '#ff3300';
      thermalBtn.style.color = '#000';
      thermalBtn.style.cursor = 'pointer';
    } else {
      thermalPanel.classList.add('locked');
      thermalPanel.style.opacity = '0.5';
      thermalPanel.style.borderColor = '#666';
      thermalBtn.disabled = true;
      thermalBtn.textContent = '🔒 LOCKED - Defeat Boss';
      thermalBtn.style.background = '#333';
      thermalBtn.style.color = '#666';
      thermalBtn.style.cursor = 'not-allowed';
    }
  }

  updateButtonStates() {
    if (!this.resourceManager || !this.ammoManager) return;

    // Button state mapping
    const buttons = [
      { btn: 'btn-convert-kinetic', resource: 'metal', ammo: 'kinetic', color: '#ff6600' },
      { btn: 'btn-convert-flux', resource: 'energy', ammo: 'flux', color: '#00aaff' },
      { btn: 'btn-convert-thermal', resource: 'thermal_core', ammo: 'thermal', color: '#ff3300' }
    ];

    buttons.forEach(({ btn, resource, ammo, color }) => {
      const button = document.getElementById(btn);
      if (!button) return;

      const hasResources = this.resourceManager.get(resource) > 0;
      const notAtMax = this.ammoManager.getAmount(ammo) < this.getMaxAmmo(ammo);

      // Skip state updates for locked thermal
      if (btn === 'btn-convert-thermal' && this.unlockManager && !this.unlockManager.isUnlocked('thermal_panel_blueprint')) {
        return;
      }

      button.disabled = !hasResources || !notAtMax;

      // Visual feedback
      if (hasResources && notAtMax) {
        button.classList.add('available');
        button.style.boxShadow = `0 0 20px rgba(${this.hexToRgb(color)}, 0.5)`;
      } else {
        button.classList.remove('available');
        button.style.boxShadow = 'none';
      }

      // Pulse if low ammo + have resources
      if (this.ammoManager.getAmount(ammo) < 20 && hasResources) {
        button.classList.add('pulse');
      } else {
        button.classList.remove('pulse');
      }

      // Disabled styling
      if (button.disabled && btn !== 'btn-convert-thermal') {
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      } else if (!button.disabled) {
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    });
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  }

  showMessage(text, type = 'info') {
    const msg = document.createElement('div');
    msg.className = `factory-message ${type}`;
    msg.textContent = text;

    const styles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px 40px',
      fontSize: '18px',
      fontWeight: 'bold',
      borderRadius: '5px',
      transition: 'opacity 0.3s',
      zIndex: '10000',
      fontFamily: "'Courier New', monospace"
    };

    if (type === 'success') {
      styles.background = 'rgba(0, 255, 100, 0.9)';
      styles.color = '#000';
    } else if (type === 'warning') {
      styles.background = 'rgba(255, 200, 0, 0.9)';
      styles.color = '#000';
    } else if (type === 'error') {
      styles.background = 'rgba(255, 50, 50, 0.9)';
      styles.color = '#fff';
    }

    Object.assign(msg.style, styles);

    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }
}
