import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Difficulty, FeedbackState } from '@/types';
import { generateProblem, calculateCorrectAnswer } from '@/lib/gameLogic';
import { getHighScore, saveHighScore } from '@/lib/storage';

const GAME_DURATION = 60;

export const useGameEngine = (soundEnabled: boolean, uiMode: 'RUGGED' | 'LUXURY') => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'IDLE',
    targetA: 0,
    targetB: 0,
    score: 0,
    highScore: 0,
    timeLeft: GAME_DURATION,
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
    if (gameState.status === 'PLAYING' && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, status: 'GAMEOVER' };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.status, gameState.timeLeft]);

  // 初期化
  const initGame = useCallback((diff?: Difficulty) => {
    const d = diff || gameState.difficulty;
    const prob = generateProblem(d); // 初回は除外なしでOK
    setGameState(prev => ({
      ...prev,
      status: 'COUNTDOWN',
      targetA: prob.a,
      targetB: prob.b,
      score: 0,
      timeLeft: GAME_DURATION,
      difficulty: d,
      penaltyLockedUntil: 0
    }));
    setFeedback(null);
  }, [gameState.difficulty]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'PLAYING' }));
  }, []);

  const handleAnswer = useCallback((ans: number) => {
    if (gameState.status !== 'PLAYING') return;

    const correct = calculateCorrectAnswer(gameState.targetA, gameState.targetB);
    
    if (ans === correct) {
      // Correct!
      // ★ 修正: 次の問題を作る際、今の答え(correct)を除外するよう指定
      const nextProb = generateProblem(gameState.difficulty, correct);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        targetA: nextProb.a,
        targetB: nextProb.b
      }));
      setFeedback({ type: 'ok', msg: `${ans}` });
      setTimeout(() => setFeedback(null), 500);
    } 
  }, [gameState.targetA, gameState.targetB, gameState.difficulty, gameState.status]);

  const handlePass = useCallback(() => {
    if (gameState.status !== 'PLAYING') return;

    // パスの場合も、今の答えとは違う問題を出したいので除外指定する
    const currentCorrect = calculateCorrectAnswer(gameState.targetA, gameState.targetB);
    const nextProb = generateProblem(gameState.difficulty, currentCorrect);
    
    setGameState(prev => ({
      ...prev,
      targetA: nextProb.a,
      targetB: nextProb.b,
    }));
    setFeedback({ type: 'pass', msg: 'PASS' });
    setTimeout(() => setFeedback(null), 500);
  }, [gameState.difficulty, gameState.status, gameState.targetA, gameState.targetB]);

  const exitGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'IDLE' }));
  }, []);

  const setDifficulty = useCallback((diff: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty: diff }));
  }, []);

  return {
    gameState,
    feedback,
    initGame,
    startGame,
    exitGame,
    handleAnswer,
    handlePass,
    setDifficulty
  };
};