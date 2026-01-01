/**
 * GameStateManager - Handles game state transitions
 * Phase 9: Added HUB, LEVEL_TRANSITION, RUN_FAILED, RUN_SUCCESS, BOSS_FIGHT states
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
      case 'HUB':
        this.game.showHub();
        break;
      case 'PLAYING':
        this.game.hideAllMenus();
        this.game.resumeTime();
        break;
      case 'LEVEL_TRANSITION':
        this.game.showLevelTransition();
        this.game.pauseTime();
        break;
      case 'WAVE_TRANSITION':
        this.game.showWaveTransition();
        break;
      case 'PAUSED':
        this.game.showPauseMenu();
        this.game.pauseTime();
        break;
      case 'BOSS_FIGHT':
        this.game.hideAllMenus();
        this.game.resumeTime();
        break;
      case 'RUN_SUCCESS':
        this.game.showRunSuccessScreen();
        this.game.pauseTime();
        break;
      case 'RUN_FAILED':
        this.game.showRunFailedScreen();
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
    return this.currentState === 'PLAYING' || this.currentState === 'BOSS_FIGHT';
  }
  
  isPaused() {
    return this.currentState === 'PAUSED';
  }
  
  isInMenu() {
    return ['MAIN_MENU', 'HUB', 'VICTORY', 'DEFEAT', 'PAUSED', 'RUN_SUCCESS', 'RUN_FAILED'].includes(this.currentState);
  }
}
