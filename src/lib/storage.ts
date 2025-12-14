const HIGHSCORE_KEY = 'between_highscore';

export const getHighScore = (): number => {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(HIGHSCORE_KEY);
  return saved ? parseInt(saved, 10) : 0;
};

export const saveHighScore = (score: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HIGHSCORE_KEY, score.toString());
};