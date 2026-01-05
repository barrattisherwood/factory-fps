export class MenuUI {
  constructor(onStartGame, onRestart, onMainMenu) {
    this.onStartGame = onStartGame;
    this.onRestart = onRestart;
    this.onMainMenu = onMainMenu;
    this.currentScreen = 'main'; // 'main', 'howto', 'credits', 'pause'
    
    this.createMainMenu();
    this.createHowToPlay();
    this.createCredits();
    this.createPauseMenu();
    
    this.showMainMenu();
  }

  createMainMenu() {
    this.mainMenuContainer = document.createElement('div');
    this.mainMenuContainer.id = 'main-menu';
    Object.assign(this.mainMenuContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'none',
      zIndex: '500',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center'
    });

    // Title
    const title = document.createElement('h1');
    title.textContent = 'BULLET FORGE';
    Object.assign(title.style, {
      fontSize: '72px',
      color: '#00ffcc',
      marginBottom: '10px',
      textShadow: '0 0 20px rgba(0,255,204,0.6)'
    });
    content.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.textContent = '[Prototype v0.1]';
    Object.assign(subtitle.style, {
      fontSize: '18px',
      color: '#888',
      marginBottom: '60px'
    });
    content.appendChild(subtitle);

    // Start button
    const startBtn = this.createButton('START MISSION', () => {
      this.hide();
      this.onStartGame();
    });
    content.appendChild(startBtn);

    // How to Play button
    const howtoBtn = this.createButton('HOW TO PLAY', () => {
      this.showHowToPlay();
    });
    content.appendChild(howtoBtn);

    // Credits button
    const creditsBtn = this.createButton('CREDITS', () => {
      this.showCredits();
    });
    content.appendChild(creditsBtn);

    this.mainMenuContainer.appendChild(content);
    document.body.appendChild(this.mainMenuContainer);
  }

  createHowToPlay() {
    this.howtoContainer = document.createElement('div');
    this.howtoContainer.id = 'howto-screen';
    Object.assign(this.howtoContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'none',
      zIndex: '500',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0',
      overflowY: 'auto'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      maxWidth: '800px',
      margin: '80px auto',
      padding: '40px',
      textAlign: 'left'
    });

    // Title
    const title = document.createElement('h1');
    title.textContent = 'HOW TO PLAY';
    Object.assign(title.style, {
      fontSize: '48px',
      color: '#00ffcc',
      marginBottom: '40px',
      textAlign: 'center'
    });
    content.appendChild(title);

    // Controls section
    const controlsTitle = document.createElement('h2');
    controlsTitle.textContent = 'CONTROLS';
    Object.assign(controlsTitle.style, {
      fontSize: '32px',
      color: '#ff6600',
      marginBottom: '20px'
    });
    content.appendChild(controlsTitle);

    const controls = [
      'WASD - Move',
      'Mouse - Look around',
      'Left Click - Shoot',
      '1/2 - Switch Ammo Type',
      'TAB - Open Factory Status',
      'ESC - Pause Game'
    ];

    controls.forEach(control => {
      const line = document.createElement('div');
      line.textContent = '• ' + control;
      line.style.fontSize = '20px';
      line.style.marginBottom = '10px';
      content.appendChild(line);
    });

    // Objective section
    const objectiveTitle = document.createElement('h2');
    objectiveTitle.textContent = 'OBJECTIVE';
    Object.assign(objectiveTitle.style, {
      fontSize: '32px',
      color: '#ff6600',
      marginTop: '40px',
      marginBottom: '20px'
    });
    content.appendChild(objectiveTitle);

    const objective = document.createElement('div');
    objective.innerHTML = `
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
        Survive 5 waves of increasingly difficult enemies.
      </p>
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
        Kill enemies to collect resources (Metal & Energy).
      </p>
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
        Resources automatically produce ammo for your weapons.
      </p>
    `;
    content.appendChild(objective);

    // Ammo types section
    const ammoTitle = document.createElement('h2');
    ammoTitle.textContent = 'AMMO TYPES';
    Object.assign(ammoTitle.style, {
      fontSize: '32px',
      color: '#ff6600',
      marginTop: '40px',
      marginBottom: '20px'
    });
    content.appendChild(ammoTitle);

    const ammoInfo = document.createElement('div');
    ammoInfo.innerHTML = `
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 15px; color: #ff6600;">
        <strong>KINETIC (Orange):</strong> Effective vs standard robots. Uses Metal resources.
      </p>
      <p style="font-size: 18px; line-height: 1.6; margin-bottom: 15px; color: #00aaff;">
        <strong>FLUX (Blue):</strong> Effective vs shielded robots. Uses Energy resources.
      </p>
    `;
    content.appendChild(ammoInfo);

    // Back button
    const backBtn = this.createButton('BACK TO MENU', () => {
      this.showMainMenu();
    });
    backBtn.style.marginTop = '60px';
    content.appendChild(backBtn);

    this.howtoContainer.appendChild(content);
    document.body.appendChild(this.howtoContainer);
  }

  createCredits() {
    this.creditsContainer = document.createElement('div');
    this.creditsContainer.id = 'credits-screen';
    Object.assign(this.creditsContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'none',
      zIndex: '500',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center'
    });

    const title = document.createElement('h1');
    title.textContent = 'CREDITS';
    Object.assign(title.style, {
      fontSize: '48px',
      color: '#00ffcc',
      marginBottom: '40px'
    });
    content.appendChild(title);

    const info = document.createElement('div');
    info.innerHTML = `
      <p style="font-size: 20px; margin-bottom: 20px;">Bullet Forge</p>
      <p style="font-size: 16px; margin-bottom: 10px; color: #888;">Developed by: Your Name</p>
      <p style="font-size: 16px; margin-bottom: 10px; color: #888;">Built with: Three.js & Vite</p>
      <p style="font-size: 16px; margin-bottom: 10px; color: #888;">Created: December 2025</p>
      <p style="font-size: 14px; margin-top: 40px; color: #666;">This is a prototype. All feedback welcome!</p>
    `;
    content.appendChild(info);

    const backBtn = this.createButton('BACK TO MENU', () => {
      this.showMainMenu();
    });
    backBtn.style.marginTop = '60px';
    content.appendChild(backBtn);

    this.creditsContainer.appendChild(content);
    document.body.appendChild(this.creditsContainer);
  }

  createPauseMenu() {
    this.pauseContainer = document.createElement('div');
    this.pauseContainer.id = 'pause-menu';
    Object.assign(this.pauseContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'none',
      zIndex: '500',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center'
    });

    const title = document.createElement('h1');
    title.textContent = '= PAUSED =';
    Object.assign(title.style, {
      fontSize: '64px',
      color: '#00ffcc',
      marginBottom: '60px'
    });
    content.appendChild(title);

    // Resume button
    const resumeBtn = this.createButton('RESUME', () => {
      this.hidePause();
    });
    content.appendChild(resumeBtn);

    // Restart button
    const restartBtn = this.createButton('RESTART MISSION', () => {
      this.hide();
      this.onRestart();
    });
    content.appendChild(restartBtn);

    // Main Menu button
    const menuBtn = this.createButton('MAIN MENU', () => {
      this.hide();
      this.onMainMenu();
      this.showMainMenu();
    });
    content.appendChild(menuBtn);

    this.pauseContainer.appendChild(content);
    document.body.appendChild(this.pauseContainer);
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    Object.assign(button.style, {
      display: 'block',
      margin: '20px auto',
      padding: '15px 40px',
      fontSize: '24px',
      backgroundColor: '#ff6600',
      color: '#000',
      border: '2px solid #ff6600',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontFamily: "'Courier New', monospace",
      transition: 'all 0.2s'
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#ff8800';
      button.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.8)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#ff6600';
      button.style.boxShadow = 'none';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  showMainMenu() {
    this.hideAll();
    this.mainMenuContainer.style.display = 'block';
    this.currentScreen = 'main';
  }

  showHowToPlay() {
    this.hideAll();
    this.howtoContainer.style.display = 'block';
    this.currentScreen = 'howto';
  }

  showCredits() {
    this.hideAll();
    this.creditsContainer.style.display = 'block';
    this.currentScreen = 'credits';
  }

  showPause() {
    this.pauseContainer.style.display = 'block';
    this.currentScreen = 'pause';
  }

  hidePause() {
    this.pauseContainer.style.display = 'none';
    this.currentScreen = null;
  }

  hideAll() {
    this.mainMenuContainer.style.display = 'none';
    this.howtoContainer.style.display = 'none';
    this.creditsContainer.style.display = 'none';
    this.pauseContainer.style.display = 'none';
    this.currentScreen = null;
  }

  hide() {
    this.hideAll();
  }

  isVisible() {
    return this.currentScreen !== null;
  }
}
