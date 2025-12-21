export class UI {
  constructor() {
    this.ammoCounter = null;
    this.crosshair = null;
    this.victoryScreen = null;

    this.createUI();
  }

  createUI() {
    // Ammo counter
    this.ammoCounter = document.createElement('div');
    this.ammoCounter.id = 'ammo-counter';
    this.ammoCounter.textContent = 'AMMO: 50';
    this.ammoCounter.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #ff9900;
      font-family: 'Courier New', monospace;
      z-index: 100;
      text-shadow: 0 0 10px rgba(255, 153, 0, 0.5);
    `;
    document.body.appendChild(this.ammoCounter);

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
  }

  updateAmmo(ammo) {
    this.ammoCounter.textContent = `AMMO: ${ammo}`;
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
