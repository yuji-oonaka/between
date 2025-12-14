import { useState, useEffect, useCallback } from 'react';
import { GameState, Difficulty, FeedbackState } from '@/types';
import { generateProblem, calculateCorrectAnswer } from '@/lib/gameLogic';
import { getHighScore, saveHighScore } from '@/lib/storage';

const GAME_DURATION = 60;

export const useGameEngine = (soundEnabled: boolean, uiMode: 'RUGGED' | 'LUXURY') => {
  const [gameState, setGameState] = useState<GameState>({
    targetA: 0,
    targetB: 0,
    score: 0,
    highScore: 0,
    timeLeft: GAME_DURATION,
    isPlaying: false,
    isGameOver: false,
    difficulty: 'NORMAL',
    penaltyLockedUntil: 0
  });

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Load High Score
  useEffect(() => {
    setGameState(prev => ({ ...prev, highScore: getHighScore() }));
  }, []);

  // Update High Score
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      saveHighScore(gameState.score);
      setGameState(prev => ({ ...prev, highScore: prev.score }));
    }
  }, [gameState.score, gameState.highScore]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, isPlaying: false, isGameOver: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.timeLeft]);

  const initGame = useCallback((diff?: Difficulty) => {
    const d = diff || gameState.difficulty;
    const prob = generateProblem(d);
    setGameState(prev => ({
      ...prev,
      targetA: prob.a,
      targetB: prob.b,
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
      isGameOver: false,
      difficulty: d,
      penaltyLockedUntil: 0
    }));
    setFeedback(null);
  }, [gameState.difficulty]);

  const handleAnswer = useCallback((ans: number) => {
    if (Date.now() < gameState.penaltyLockedUntil) return;

    const correct = calculateCorrectAnswer(gameState.targetA, gameState.targetB);
    
    if (ans === correct) {
      // Correct
      const nextProb = generateProblem(gameState.difficulty);
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        targetA: nextProb.a,
        targetB: nextProb.b
      }));
      setFeedback({ type: 'ok', msg: `${ans}` });
      setTimeout(() => setFeedback(null), 500);
    } else {
      // Wrong
      setGameState(prev => ({
        ...prev,
        penaltyLockedUntil: Date.now() + 500
      }));
      setFeedback({ type: 'ng', msg: 'LOCKED' });
      setTimeout(() => setFeedback(null), 500);
    }
  }, [gameState.targetA, gameState.targetB, gameState.difficulty, gameState.penaltyLockedUntil]);

  const handlePass = useCallback(() => {
    const nextProb = generateProblem(gameState.difficulty);
    setGameState(prev => ({
      ...prev,
      targetA: nextProb.a,
      targetB: nextProb.b,
      penaltyLockedUntil: Date.now() + 500
    }));
    setFeedback({ type: 'pass', msg: 'PASS' });
    setTimeout(() => setFeedback(null), 500);
  }, [gameState.difficulty]);

  const exitGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false, isGameOver: false }));
  }, []);

  const setDifficulty = useCallback((diff: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty: diff }));
  }, []);

  return {
    gameState,
    feedback,
    initGame,
    exitGame,
    handleAnswer,
    handlePass,
    setDifficulty
  };
};