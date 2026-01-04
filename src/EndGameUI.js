export class EndGameUI {
  constructor(onPlayAgain, onMainMenu) {
    this.onPlayAgain = onPlayAgain;
    this.onMainMenu = onMainMenu;
    
    this.createVictoryScreen();
    this.createDefeatScreen();
  }

  createVictoryScreen() {
    this.victoryContainer = document.createElement('div');
    this.victoryContainer.id = 'victory-screen';
    Object.assign(this.victoryContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'none',
      zIndex: '600',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0',
      overflowY: 'auto'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      maxWidth: '700px',
      margin: '80px auto',
      padding: '40px',
      textAlign: 'center',
      border: '3px solid #00ffcc',
      borderRadius: '10px',
      backgroundColor: 'rgba(0,255,204,0.05)'
    });

    // Title
    const title = document.createElement('h1');
    title.textContent = 'MISSION COMPLETE';
    Object.assign(title.style, {
      fontSize: '64px',
      color: '#00ffcc',
      marginBottom: '10px',
      textShadow: '0 0 30px rgba(0,255,204,0.8)'
    });
    content.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'ALL WAVES CLEARED';
    Object.assign(subtitle.style, {
      fontSize: '20px',
      color: '#00ff00',
      marginBottom: '40px'
    });
    content.appendChild(subtitle);

    // Stats container
    this.victoryStats = document.createElement('div');
    Object.assign(this.victoryStats.style, {
      textAlign: 'left',
      fontSize: '18px',
      lineHeight: '2'
    });
    content.appendChild(this.victoryStats);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '40px';

    const playAgainBtn = this.createButton('PLAY AGAIN', () => {
      this.hide();
      this.onPlayAgain();
    });
    buttonContainer.appendChild(playAgainBtn);

    const menuBtn = this.createButton('MAIN MENU', () => {
      this.hide();
      this.onMainMenu();
    });
    menuBtn.style.backgroundColor = '#444';
    menuBtn.style.borderColor = '#444';
    buttonContainer.appendChild(menuBtn);

    content.appendChild(buttonContainer);

    this.victoryContainer.appendChild(content);
    document.body.appendChild(this.victoryContainer);
  }

  createDefeatScreen() {
    this.defeatContainer = document.createElement('div');
    this.defeatContainer.id = 'defeat-screen';
    Object.assign(this.defeatContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'none',
      zIndex: '600',
      fontFamily: "'Courier New', monospace",
      color: '#e0e0e0'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      maxWidth: '700px',
      margin: '120px auto',
      padding: '40px',
      textAlign: 'center',
      border: '3px solid #ff0000',
      borderRadius: '10px',
      backgroundColor: 'rgba(255,0,0,0.05)'
    });

    // Title
    const title = document.createElement('h1');
    title.textContent = 'MISSION FAILED';
    Object.assign(title.style, {
      fontSize: '64px',
      color: '#ff0000',
      marginBottom: '10px',
      textShadow: '0 0 30px rgba(255,0,0,0.8)'
    });
    content.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'UNIT DESTROYED';
    Object.assign(subtitle.style, {
      fontSize: '20px',
      color: '#ff6600',
      marginBottom: '40px'
    });
    content.appendChild(subtitle);

    // Stats container
    this.defeatStats = document.createElement('div');
    Object.assign(this.defeatStats.style, {
      textAlign: 'left',
      fontSize: '18px',
      lineHeight: '2'
    });
    content.appendChild(this.defeatStats);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '40px';

    const tryAgainBtn = this.createButton('TRY AGAIN', () => {
      this.hide();
      this.onPlayAgain();
    });
    buttonContainer.appendChild(tryAgainBtn);

    const menuBtn = this.createButton('MAIN MENU', () => {
      this.hide();
      this.onMainMenu();
    });
    menuBtn.style.backgroundColor = '#444';
    menuBtn.style.borderColor = '#444';
    buttonContainer.appendChild(menuBtn);

    content.appendChild(buttonContainer);

    this.defeatContainer.appendChild(content);
    document.body.appendChild(this.defeatContainer);
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    Object.assign(button.style, {
      display: 'inline-block',
      margin: '10px 15px',
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
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.8)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = 'none';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  showVictory(stats) {
    const favorite = stats.favoriteAmmo;
    
    this.victoryStats.innerHTML = `
      <p><strong>Waves Survived:</strong> ${stats.wavesCompleted}/5</p>
      <p><strong>Enemies Eliminated:</strong> ${stats.kills}</p>
      <p><strong>Accuracy:</strong> ${stats.accuracy}%</p>
      <p style="margin-top: 20px;"><strong>Resources Collected:</strong></p>
      <p style="padding-left: 20px;">├─ Metal: ${stats.resourcesCollected.metal}</p>
      <p style="padding-left: 20px;">└─ Energy: ${stats.resourcesCollected.energy}</p>
      <p style="margin-top: 20px;"><strong>Favorite Ammo:</strong> ${favorite.type} (${favorite.percentage}%)</p>
      <p style="margin-top: 20px;"><strong>Time:</strong> ${stats.playTime}</p>
    `;

    this.victoryContainer.style.display = 'block';
  }

  showDefeat(stats) {
    this.defeatStats.innerHTML = `
      <p><strong>Survived:</strong> Wave ${stats.wavesCompleted}/5</p>
      <p><strong>Enemies Eliminated:</strong> ${stats.kills}</p>
      <p><strong>Accuracy:</strong> ${stats.accuracy}%</p>
      <p style="margin-top: 20px;"><strong>Time Survived:</strong> ${stats.playTime}</p>
    `;

    this.defeatContainer.style.display = 'block';
  }

  hide() {
    this.victoryContainer.style.display = 'none';
    this.defeatContainer.style.display = 'none';
  }
}
