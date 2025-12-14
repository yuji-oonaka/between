import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameConfig, GameState, FeedbackState } from "@/types";
import { Keypad } from "@/components/ui/Keypad";
import { NumberPanel } from "@/components/ui/NumberPanel";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface GameScreenProps {
  config: GameConfig;
  gameState: GameState;
  feedback: FeedbackState | null;
  onAnswer: (val: number) => void;
  onPass: () => void;
  onAbort: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  config,
  gameState,
  feedback,
  onAnswer,
  onPass,
  onAbort,
}) => {
  const [inputBuffer, setInputBuffer] = useState("");
  const isRugged = config.uiMode === "RUGGED";

  // Voice Control
  const { isListening, start: startMic } = useVoiceInput(
    config.inputMode === "VOICE" && gameState.isPlaying,
    (val) => {
      if (val === "PASS") onPass();
      else onAnswer(val);
    }
  );

  // Initialize Mic
  useEffect(() => {
    if (config.inputMode === "VOICE" && gameState.isPlaying) {
      startMic();
    }
  }, [config.inputMode, gameState.isPlaying, startMic]);

  // Keypad Handlers
  const handleKeypadInput = (char: string) => {
    if (inputBuffer.length < 5) setInputBuffer((prev) => prev + char);
  };
  const handleKeypadEnter = () => {
    if (inputBuffer) {
      onAnswer(parseInt(inputBuffer));
      setInputBuffer("");
    }
  };
  const handleKeypadDelete = () => {
    setInputBuffer((prev) => prev.slice(0, -1));
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying || config.inputMode !== "KEYPAD") return;

      if (e.key >= "0" && e.key <= "9") {
        handleKeypadInput(e.key);
      } else if (e.key === "Enter") {
        handleKeypadEnter();
      } else if (e.key === "Backspace") {
        handleKeypadDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isPlaying, config.inputMode, inputBuffer]); // deps

  const containerStyle = isRugged
    ? "bg-white text-black font-mono selection:bg-black selection:text-white"
    : "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white font-sans";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-between p-4 sm:p-8",
        containerStyle,
        feedback?.type === "ng" && (isRugged ? "bg-red-100" : "bg-red-900/50")
      )}
    >
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-end border-b-2 border-current pb-4 mb-4 opacity-80">
        <div className="flex flex-col">
          <span className="text-xs font-bold opacity-50">TIME</span>
          <span
            className={cn(
              "text-4xl font-black tabular-nums leading-none",
              gameState.timeLeft < 10 && "text-red-500 animate-pulse"
            )}
          >
            {gameState.timeLeft}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold opacity-50">SCORE</span>
          <span className="text-4xl font-black tabular-nums leading-none">
            {gameState.score}
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center relative">
        <NumberPanel
          a={gameState.targetA}
          b={gameState.targetB}
          uiMode={config.uiMode}
        />

        {/* Input Feedback / Buffer */}
        <div className="h-20 flex items-center justify-center w-full mb-4">
          {feedback ? (
            <span
              className={cn(
                "text-5xl font-black animate-ping-once",
                feedback.type === "ok"
                  ? "text-green-500"
                  : feedback.type === "ng"
                  ? "text-red-500"
                  : "text-blue-500"
              )}
            >
              {feedback.msg}
            </span>
          ) : (
            <span
              className={cn(
                "text-5xl font-black tracking-widest border-b-4",
                inputBuffer
                  ? "border-current opacity-100"
                  : "border-transparent opacity-20"
              )}
            >
              {inputBuffer || "?"}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-xs">
          {config.inputMode === "KEYPAD" ? (
            <Keypad
              uiMode={config.uiMode}
              onInput={handleKeypadInput}
              onDelete={handleKeypadDelete}
              onEnter={handleKeypadEnter}
              onPass={onPass}
              disabled={!!feedback}
            />
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-2xl",
                isListening
                  ? isRugged
                    ? "bg-red-100 text-red-600"
                    : "bg-red-500/20 text-red-200 animate-pulse"
                  : "opacity-50"
              )}
            >
              {isListening ? <Mic size={48} /> : <MicOff size={48} />}
              <span className="mt-4 font-bold text-sm tracking-widest">
                {isListening ? "LISTENING..." : "PAUSED"}
              </span>
              <p className="mt-2 text-xs opacity-60">"パス" でスキップ</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={onAbort}
        className="mt-8 text-xs font-bold opacity-30 hover:opacity-100 transition-opacity"
      >
        ABORT GAME
      </button>

      <style jsx global>{`
        @keyframes ping-once {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-ping-once {
          animation: ping-once 0.4s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};
