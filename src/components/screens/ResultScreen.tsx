import React from "react";
import { RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameState, UIMode } from "@/types";

interface ResultScreenProps {
  gameState: GameState;
  uiMode: UIMode;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  gameState,
  uiMode,
  onRetry,
  onHome,
}) => {
  const isRugged = uiMode === "RUGGED";

  const containerStyle = isRugged
    ? "bg-white text-black font-mono selection:bg-black selection:text-white"
    : "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white font-sans";

  const buttonStyle = isRugged
    ? "border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase font-bold text-sm"
    : "bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full font-bold backdrop-blur text-sm transition-transform active:scale-95";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-8 text-center",
        containerStyle
      )}
    >
      <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl font-bold opacity-60">FINISHED</h2>
          <div className="text-8xl font-black tracking-tighter">
            {gameState.score}
          </div>
        </div>

        <div
          className={cn(
            "p-6 max-w-xs mx-auto",
            isRugged ? "bg-gray-100" : "bg-white/10 rounded-xl"
          )}
        >
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>DIFFICULTY</span>
            <span>{gameState.difficulty}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>HIGH SCORE</span>
            <span>{Math.max(gameState.score, gameState.highScore)}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-8">
          <button onClick={onHome} className={buttonStyle}>
            <Home size={20} />
          </button>
          <button onClick={onRetry} className={buttonStyle}>
            <RotateCcw size={20} /> RETRY
          </button>
        </div>
      </div>
    </div>
  );
};
