import './style.css';

export class FactoryUI {
  constructor(eventBus, game) {
    this.eventBus = eventBus;
    this.game = game;
    this.isOpen = false;

    this.resources = { metal: 0, energy: 0, thermal_core: 0 };
    this.ammo = { kinetic: 0, flux: 0, thermal: 0 };

    this.createOverlay();
    this.setupEventListeners();
    this.bindKeys();
  }

  bindKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
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
    this.backdrop.id = 'factory-backdrop';
    Object.assign(this.backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'none',
      zIndex: 300,
      fontFamily: "'Courier New', monospace",
    });

    // Center panel
    this.panel = document.createElement('div');
    Object.assign(this.panel.style, {
      width: '720px',
      maxWidth: '90%',
      margin: '6% auto',
      background: 'transparent',
      color: '#e0e0e0',
      border: '2px solid #00ffcc',
      padding: '18px',
      borderRadius: '8px',
      boxShadow: '0 0 40px rgba(0,255,204,0.05)'
    });

    // Header
    const header = document.createElement('div');
    header.textContent = 'ORBITAL RIG - AUTO-PRODUCTION';
    Object.assign(header.style, {
      fontSize: '20px',
      textAlign: 'center',
      marginBottom: '8px',
      color: '#00ffcc'
    });
    this.panel.appendChild(header);
    
    // Subheader explaining auto-production
    const subheader = document.createElement('div');
    subheader.textContent = 'Resources are automatically converted to ammunition when collected';
    Object.assign(subheader.style, {
      fontSize: '12px',
      textAlign: 'center',
      marginBottom: '12px',
      color: '#888',
      fontStyle: 'italic'
    });
    this.panel.appendChild(subheader);

    // Resources area
    const resBox = document.createElement('div');
    Object.assign(resBox.style, { marginBottom: '12px' });

    const resTitle = document.createElement('div');
    resTitle.textContent = 'RESOURCES COLLECTED:';
    resBox.appendChild(resTitle);

    // Metal line
    this.metalLine = document.createElement('div');
    this.metalLine.style.marginTop = '6px';
    resBox.appendChild(this.metalLine);

    // Energy line
    this.energyLine = document.createElement('div');
    this.energyLine.style.marginTop = '6px';
    resBox.appendChild(this.energyLine);

    this.panel.appendChild(resBox);

    // Separator
    const sep = document.createElement('hr');
    Object.assign(sep.style, { border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '12px 0' });
    this.panel.appendChild(sep);

    // Production panels
    this.productionArea = document.createElement('div');
    this.productionArea.style.display = 'flex';
    this.productionArea.style.justifyContent = 'space-between';
    this.productionArea.style.flexWrap = 'wrap';
    this.productionArea.style.gap = '10px';

    // Kinetic panel
    this.kineticPanel = this.createPanel('KINETIC PANEL', '#ff6600');
    this.productionArea.appendChild(this.kineticPanel.container);

    // Flux panel
    this.fluxPanel = this.createPanel('FLUX PANEL', '#00aaff');
    this.productionArea.appendChild(this.fluxPanel.container);
    
    // Thermal panel (Phase 9 - hidden until unlocked)
    this.thermalPanel = this.createPanel('THERMAL PANEL', '#ff3300');
    this.thermalPanel.container.style.display = 'none'; // Hidden by default
    this.productionArea.appendChild(this.thermalPanel.container);

    this.panel.appendChild(this.productionArea);

    // Footer / controls
    const footer = document.createElement('div');
    footer.style.marginTop = '12px';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';

    const closeHint = document.createElement('div');
    closeHint.textContent = '[TAB] Close    [1][2] Switch Ammo';
    closeHint.style.color = '#cfcfcf';
    footer.appendChild(closeHint);

    this.panel.appendChild(footer);

    this.backdrop.appendChild(this.panel);
    document.body.appendChild(this.backdrop);

    this.updateDisplay();
  }

  createPanel(title, accentColor) {
    const container = document.createElement('div');
    container.style.width = '48%';
    container.style.border = `1px solid rgba(255,255,255,0.04)`;
    container.style.padding = '10px';
    container.style.borderRadius = '6px';

    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontWeight = 'bold';
    titleEl.style.color = accentColor;
    titleEl.style.marginBottom = '8px';
    container.appendChild(titleEl);

    const inputLine = document.createElement('div');
    inputLine.textContent = 'Input: —';
    container.appendChild(inputLine);

    const outputLine = document.createElement('div');
    outputLine.textContent = 'Output: —';
    container.appendChild(outputLine);

    const stockLine = document.createElement('div');
    stockLine.textContent = 'Current Stock: 0';
    container.appendChild(stockLine);

    const statusLine = document.createElement('div');
    statusLine.textContent = 'Status:';
    statusLine.style.marginTop = '8px';
    container.appendChild(statusLine);

    const barOuter = document.createElement('div');
    Object.assign(barOuter.style, {
      width: '100%',
      height: '10px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '6px',
      overflow: 'hidden',
      marginTop: '6px'
    });
    const barInner = document.createElement('div');
    Object.assign(barInner.style, {
      width: '0%',
      height: '100%',
      background: accentColor,
      transition: 'width 300ms linear'
    });
    barOuter.appendChild(barInner);
    container.appendChild(barOuter);

    return {
      container,
      titleEl,
      inputLine,
      outputLine,
      stockLine,
      statusLine,
      barInner
    };
  }

  setupEventListeners() {
    this.eventBus.on('resource:changed', (data) => {
      // Track all resource types
      if (this.resources.hasOwnProperty(data.type)) {
        this.resources[data.type] = data.amount;
        this.updateDisplay();
      }
    });

    this.eventBus.on('ammo:state', (data) => {
      this.ammo = data.amounts;
      this.updateDisplay();
    });

    this.eventBus.on('ammo:changed', (data) => {
      // Track all ammo types
      if (this.ammo.hasOwnProperty(data.type)) {
        this.ammo[data.type] = data.amount;
        this.updateDisplay();
      }
    });

    this.eventBus.on('production:produced', (data) => {
      // Pulse animation when production occurs
      if (data.resource === 'metal') this.pulsePanel(this.kineticPanel);
      if (data.resource === 'energy') this.pulsePanel(this.fluxPanel);
      if (data.resource === 'thermal_core' && this.thermalPanel) this.pulsePanel(this.thermalPanel);
    });
  }

  pulsePanel(panel) {
    panel.container.style.boxShadow = '0 0 18px rgba(255,255,255,0.08)';
    setTimeout(() => panel.container.style.boxShadow = 'none', 300);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.show(); else this.hide();
  }

  show() {
    this.backdrop.style.display = 'block';
    this.game.setTimeScale(0.3);
    this.updateDisplay();
  }

  hide() {
    this.backdrop.style.display = 'none';
    this.game.setTimeScale(1.0);
  }

  updateDisplay() {
    // Update resource lines (show that they're being stored, not sitting idle)
    this.metalLine.textContent = `├─ Metal:  ${this.resources.metal} collected  ` + this.renderBar(this.resources.metal, 80, '#ff6600');
    this.energyLine.textContent = `└─ Energy: ${this.resources.energy} collected  ` + this.renderBar(this.resources.energy, 80, '#00aaff');

    // Kinetic panel
    this.kineticPanel.inputLine.textContent = '├─ Input: Metal → Auto-Convert';
    this.kineticPanel.outputLine.textContent = '├─ Output: Kinetic Ammo (instant)';
    this.kineticPanel.stockLine.textContent = `├─ Current Stock: ${this.ammo.kinetic || 0} rounds`;
    const metal = this.resources.metal || 0;
    this.kineticPanel.statusLine.textContent = '└─ Status: Active (converts on pickup)';
    this.kineticPanel.barInner.style.width = Math.min(100, (this.ammo.kinetic / 100) * 100) + '%';

    // Flux panel
    this.fluxPanel.inputLine.textContent = '├─ Input: Energy → Auto-Convert';
    this.fluxPanel.outputLine.textContent = '├─ Output: Flux Ammo (instant)';
    this.fluxPanel.stockLine.textContent = `├─ Current Stock: ${this.ammo.flux || 0} rounds`;
    const energy = this.resources.energy || 0;
    this.fluxPanel.statusLine.textContent = '└─ Status: Active (converts on pickup)';
    this.fluxPanel.barInner.style.width = Math.min(100, (this.ammo.flux / 50) * 100) + '%';
    
    // Thermal panel (if unlocked)
    if (this.thermalPanel && (this.resources.thermal_core > 0 || this.ammo.thermal > 0 || window.game?.unlockManager?.isUnlocked('thermal_panel_blueprint'))) {
      this.thermalPanel.container.style.display = 'block';
      this.thermalPanel.inputLine.textContent = '├─ Input: Thermal Core → Auto-Convert';
      this.thermalPanel.outputLine.textContent = '├─ Output: Thermal Ammo (instant)';
      this.thermalPanel.stockLine.textContent = `├─ Current Stock: ${this.ammo.thermal || 0} rounds`;
      this.thermalPanel.statusLine.textContent = '└─ Status: Active (converts on pickup)';
      this.thermalPanel.barInner.style.width = Math.min(100, (this.ammo.thermal / 50) * 100) + '%';
    } else if (this.thermalPanel) {
      this.thermalPanel.container.style.display = 'none';
    }
  }

  renderBar(value, max, color) {
    const pct = Math.max(0, Math.min(1, value / max));
    const blocks = Math.round(pct * 10);
    const bar = '[' + '█'.repeat(blocks) + '░'.repeat(10 - blocks) + `]`;
    return bar;
  }
}
