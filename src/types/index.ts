export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type UIMode = 'RUGGED' | 'LUXURY';
export type InputMode = 'VOICE' | 'KEYPAD';

export interface GameConfig {
  difficulty: Difficulty;
  uiMode: UIMode;
  inputMode: InputMode;
  isSoundEnabled: boolean;
}

export interface GameState {
  targetA: number;
  targetB: number;
  score: number;
  highScore: number;
  timeLeft: number;
  isPlaying: boolean;
  isGameOver: boolean;
  difficulty: Difficulty;
  penaltyLockedUntil: number; // タイムスタンプ
}

export interface FeedbackState {
  type: 'ok' | 'ng' | 'pass';
  msg: string;
}

export interface Problem {
  a: number;
  b: number;
}