// gameState.ts
import { Mesh } from './types/types';

const INIT = {
  score: 0,
  time: 480,
  lives: 3,
  currentCam: 'wide' as const,
};

let score_el: HTMLElement | null = null;
let time_el: HTMLElement | null = null;
let lives_el: HTMLElement | null = null;

function initUI() {
  score_el = document.querySelector('#scoreUI');
  time_el = document.querySelector('#timeUI');
  lives_el = document.querySelector('#livesUI');

  if (!score_el || !time_el || !lives_el) {
    throw new Error('UI elements not found');
  }

  score_el.textContent = `Score: ${INIT.score}`;
  time_el.textContent = `Time: ${INIT.time}`;
  lives_el.textContent = `Lives: ${INIT.lives}`;
}

document.addEventListener('DOMContentLoaded', initUI);

export class GameState {
  private static instance: GameState;

  private _currentCam: 'wide' | 'frog' = INIT.currentCam;
  private _isGameOver = false;
  private _score = INIT.score;
  private _time = INIT.time;
  private _lives = INIT.lives;

  private _isOnLog = false; // move to collision.ts
  // private _currentLogMovement = new Vector3(0, 0, 0); // its a THREE.Vector3
  private _currentLog: Mesh | null = null;

  private constructor() {
    // Only update UI if document is already loaded
    if (document.readyState === 'complete') {
      this.updateUI();
    } else {
      // Otherwise wait for DOM to load
      document.addEventListener('DOMContentLoaded', () => {
        this.updateUI();
      });
    }
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  // Public getters and setters
  get isOnLog(): boolean {
    return this._isOnLog;
  }

  get currentLog(): Mesh | null {
    return this._currentLog;
  }

  // if null frog is not on a log
  updateCurrentLog(log: Mesh | null) {
    this._currentLog = log;
  }

  get score(): number {
    return this._score;
  }

  get time(): number {
    return this._time;
  }

  get lives(): number {
    return this._lives;
  }

  get currentCam(): 'wide' | 'frog' {
    return this._currentCam;
  }

  get isGameOver(): boolean {
    return this._isGameOver;
  }

  private updateUI() {
    if (!score_el || !time_el || !lives_el) {
      console.error('UI elements not found');
      return;
    }

    time_el.style.color = 'whitesmoke';
    score_el.style.color = 'whitesmoke';
    lives_el.style.color = 'whitesmoke';

    score_el.textContent = `Score: ${this._score.toString()}`;
    time_el.textContent = `Time: ${this._time.toString()}`;
    lives_el.textContent = `Lives: ${this._lives.toString()}`;
  }

  updateScore(delta: number) {
    this._score += delta;
    this.updateUI();
  }

  updateTime(delta: number) {
    this._time += delta;
    this.updateUI();
  }

  updateLives(delta: number) {
    this._lives += delta;
    this.updateUI();
    if (this._lives === 0) {
      this.gameOver();
      return;
    }
  }

  toggleCamera(): 'wide' | 'frog' {
    this._currentCam = this._currentCam === 'wide' ? 'frog' : 'wide';
    return this._currentCam;
  }

  reset() {
    this._score = INIT.score;
    this._time = INIT.time;
    this._lives = INIT.lives;
    this._currentCam = INIT.currentCam;
    this._isGameOver = false;
    this.updateUI();
  }

  gameOver() {
    this._isGameOver = true;
    this._currentCam = 'wide';

    // Update UI elements
    time_el!.textContent = `Time's up!`;
    time_el!.style.color = 'red';

    score_el!.textContent = `Final Score: ${this._score}`;
    score_el!.style.color = 'red';

    lives_el!.textContent = `He dead`;
    lives_el!.style.color = 'red';

    // Optional: Disable UI controls if they exist
    const switchCamBtn = document.querySelector(
      '#switchCam'
    ) as HTMLButtonElement;
    if (switchCamBtn) {
      switchCamBtn.disabled = true;
    }

    // Log final game state
    console.log('Game Over!', {
      finalScore: this._score,
      timeRemaining: this._time,
      totalLives: this._lives,
    });

    // Optional: Reset game state after a delay
    setTimeout(() => {
      this.reset();
    }, 5000);
  }
}
// export interface GameState {
//   score: number;
//   time: number;
//   lives: number;
//   currentCam: 'wide' | 'frog';
// }

// class GameStateManager {
//   private state: GameState = {
//     score: 0,
//     time: 480,
//     lives: 4,
//     currentCam: 'wide',
//   };

//   // UI Elements
//   private scoreUI: HTMLElement | null;
//   private timeUI: HTMLElement | null;
//   private livesUI: HTMLElement | null;

//   constructor() {
//     this.scoreUI = document.querySelector('#scoreUI');
//     this.timeUI = document.querySelector('#timeUI');
//     this.livesUI = document.querySelector('#livesUI');
//     this.updateUI();
//   }

//   private updateUI() {
//     if (this.scoreUI) this.scoreUI.textContent = `Score: ${this.state.score}`;
//     if (this.timeUI) this.timeUI.textContent = `Time: ${this.state.time}`;
//     if (this.livesUI) this.livesUI.textContent = `Lives: ${this.state.lives}`;
//   }

//   updateScore(delta: number) {
//     this.state.score += delta;
//     this.updateUI();
//   }

//   updateTime(delta: number) {
//     this.state.time += delta;
//     this.updateUI();
//   }

//   updateLives(delta: number) {
//     this.state.lives += delta;
//     this.updateUI();
//   }

//   toggleCamera() {
//     this.state.currentCam = this.state.currentCam === 'wide' ? 'frog' : 'wide';
//     return this.state.currentCam;
//   }

//   getCurrentCam() {
//     return this.state.currentCam;
//   }
// }

// export const gameState = new GameStateManager();
