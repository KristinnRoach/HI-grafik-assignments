export interface GameState {
  score: number;
  time: number;
  lives: number;
  currentCam: 'wide' | 'frog';
}

class GameStateManager {
  private state: GameState = {
    score: 0,
    time: 480,
    lives: 4,
    currentCam: 'wide',
  };

  // UI Elements
  private scoreUI: HTMLElement | null;
  private timeUI: HTMLElement | null;
  private livesUI: HTMLElement | null;

  constructor() {
    this.scoreUI = document.querySelector('#scoreUI');
    this.timeUI = document.querySelector('#timeUI');
    this.livesUI = document.querySelector('#livesUI');
    this.updateUI();
  }

  private updateUI() {
    if (this.scoreUI) this.scoreUI.textContent = `Score: ${this.state.score}`;
    if (this.timeUI) this.timeUI.textContent = `Time: ${this.state.time}`;
    if (this.livesUI) this.livesUI.textContent = `Lives: ${this.state.lives}`;
  }

  updateScore(delta: number) {
    this.state.score += delta;
    this.updateUI();
  }

  updateTime(delta: number) {
    this.state.time += delta;
    this.updateUI();
  }

  updateLives(delta: number) {
    this.state.lives += delta;
    this.updateUI();
  }

  toggleCamera() {
    this.state.currentCam = this.state.currentCam === 'wide' ? 'frog' : 'wide';
    return this.state.currentCam;
  }

  getCurrentCam() {
    return this.state.currentCam;
  }
}

export const gameState = new GameStateManager();
