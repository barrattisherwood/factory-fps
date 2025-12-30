/**
 * GameStateManager - Handles game state transitions
 * States: MAIN_MENU, PLAYING, WAVE_TRANSITION, PAUSED, VICTORY, DEFEAT
 */
export class GameStateManager {
  constructor(game) {
    this.game = game;
    this.currentState = 'MAIN_MENU';
    this.previousState = null;
  }
  
  changeState(newState) {
    console.log(`State: ${this.currentState} → ${newState}`);
    this.previousState = this.currentState;
    this.currentState = newState;
    this.onStateEnter(newState);
  }
  
  onStateEnter(state) {
    switch(state) {
      case 'MAIN_MENU':
        this.game.showMainMenu();
        break;
      case 'PLAYING':
        this.game.hideAllMenus();
        this.game.resumeTime();
        break;
      case 'WAVE_TRANSITION':
        this.game.showWaveTransition();
        break;
      case 'PAUSED':
        this.game.showPauseMenu();
        this.game.pauseTime();
        break;
      case 'VICTORY':
        this.game.showVictoryScreen();
        this.game.pauseTime();
        break;
      case 'DEFEAT':
        this.game.showDefeatScreen();
        this.game.pauseTime();
        break;
    }
  }
  
  isPlaying() {
    return this.currentState === 'PLAYING';
  }
  
  isPaused() {
    return this.currentState === 'PAUSED';
  }
  
  isInMenu() {
    return ['MAIN_MENU', 'VICTORY', 'DEFEAT', 'PAUSED'].includes(this.currentState);
  }
}
