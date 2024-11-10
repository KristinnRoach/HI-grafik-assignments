// gameState.ts
import { Mesh } from './types/types';

const INIT = {
  level: 0,
  // time: 480,
  lives: 3,
  currentCam: 'wide' as const,
};

let level_el: HTMLElement | null = null;
let time_el: HTMLElement | null = null;
let lives_el: HTMLElement | null = null;

function initUI() {
  level_el = document.querySelector('#scoreUI');
  time_el = document.querySelector('#timeUI');
  lives_el = document.querySelector('#livesUI');

  if (!level_el || !time_el || !lives_el) {
    throw new Error('UI elements not found');
  }

  level_el.textContent = `Level: ${INIT.level}`;
  time_el.textContent = ''; // `Time: ${INIT.time}`;
  lives_el.textContent = `Lives: ${INIT.lives}`;
}

document.addEventListener('DOMContentLoaded', initUI);

export class GameState {
  private static instance: GameState;

  private _currentCam: 'wide' | 'frog' = INIT.currentCam;
  private _isGameOver = false;
  private _level = INIT.level;
  private _time = 0;
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
    return this._level;
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
    if (!level_el || !lives_el) {
      // || !time_el
      console.error('UI elements not found');
      return;
    }

    // time_el.style.color = 'whitesmoke';
    level_el.style.color = 'whitesmoke';
    lives_el.style.color = 'whitesmoke';

    level_el.textContent = `Score: ${this._level.toString()}`;
    // time_el.textContent = `Time: ${this._time.toString()}`;
    lives_el.textContent = `Lives: ${this._lives.toString()}`;
  }

  updateLevel(delta: number) {
    this._level += delta;
    this.updateUI();
  }

  updateTime(delta: number) {
    // this._time += delta;
    // this.updateUI();
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
    this._level = INIT.level;
    // this._time = INIT.time;
    this._lives = INIT.lives;
    this._currentCam = INIT.currentCam;
    this._isGameOver = false;
    this.updateUI();
  }

  gameOver() {
    this._isGameOver = true;
    this._currentCam = 'wide';

    // Update UI elements
    time_el!.textContent = `Game Over`;
    time_el!.style.color = 'red';

    level_el!.textContent = `Final Score: ${this._level}`;
    level_el!.style.color = 'red';

    lives_el!.textContent = `He dead`;
    lives_el!.style.color = 'red';

    // Optional: Disable UI controls if they exist
    // const switchCamBtn = document.querySelector(
    //   '#switchCam'
    // ) as HTMLButtonElement;
    // if (switchCamBtn) {
    //   switchCamBtn.disabled = true;
    // }

    // Log final game state
    console.log('Game Over!', {
      level: this._level,
      // timeRemaining: this._time,
      totalLives: this._lives,
    });

    // Optional: Reset game state after a delay
    setTimeout(() => {
      this.reset();
    }, 5000);
  }
}
