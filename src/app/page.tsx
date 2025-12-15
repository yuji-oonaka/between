"use client";

import React, { useState } from "react";
import { GameConfig } from "@/types";
import { useGameEngine } from "@/hooks/useGameEngine";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { GameScreen } from "@/components/screens/GameScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";

export default function BetweenApp() {
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "NORMAL",
    uiMode: "RUGGED",
    inputMode: "KEYPAD",
    isSoundEnabled: true,
  });

  const {
    gameState,
    feedback,
    initGame,
    startGame, // 追加
    exitGame,
    handleAnswer,
    handlePass,
    setDifficulty,
  } = useGameEngine(config.isSoundEnabled, config.uiMode);

  // Difficulty sync
  React.useEffect(() => {
    setDifficulty(config.difficulty);
  }, [config.difficulty, setDifficulty]);

  // 1. Home Screen
  if (gameState.status === "IDLE") {
    return (
      <HomeScreen
        config={config}
        setConfig={setConfig}
        highScore={gameState.highScore}
        onStart={() => initGame()}
      />
    );
  }

  // 2. Result Screen
  if (gameState.status === "GAMEOVER") {
    return (
      <ResultScreen
        gameState={gameState}
        uiMode={config.uiMode}
        onRetry={() => initGame()}
        onHome={exitGame}
      />
    );
  }

  // 3. Game Screen (COUNTDOWN or PLAYING)
  return (
    <GameScreen
      config={config}
      gameState={gameState}
      feedback={feedback}
      onAnswer={handleAnswer}
      onPass={handlePass}
      onAbort={exitGame}
      onStartGame={startGame} // カウントダウン終了時に呼ぶ関数
    />
  );
}
