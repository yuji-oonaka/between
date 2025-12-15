export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type UIMode = 'RUGGED' | 'LUXURY';
export type InputMode = 'VOICE' | 'KEYPAD';

// ゲームの状態を明確に定義
export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';

export interface GameConfig {
  difficulty: Difficulty;
  uiMode: UIMode;
  inputMode: InputMode;
  isSoundEnabled: boolean;
}

export interface GameState {
  status: GameStatus; // 現在の状態
  targetA: number;
  targetB: number;
  score: number;
  highScore: number;
  timeLeft: number;
  difficulty: Difficulty;
  penaltyLockedUntil: number;
}

export interface FeedbackState {
  type: 'ok' | 'ng' | 'pass';
  msg: string;
}

export interface Problem {
  a: number;
  b: number;
}