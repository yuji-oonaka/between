import React from "react";
import { Mic, Keyboard, Settings, Zap, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameConfig, Difficulty } from "@/types";

interface HomeScreenProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  highScore: number;
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  config,
  setConfig,
  highScore,
  onStart,
}) => {
  const isRugged = config.uiMode === "RUGGED";

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-500",
        isRugged
          ? "bg-white text-black font-mono selection:bg-black selection:text-white"
          : "bg-linear-to-br from-indigo-900 via-purple-900 to-black text-white font-sans"
      )}
    >
      <div className="max-w-md w-full space-y-12">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1
            className={cn(
              "text-6xl font-black tracking-tighter",
              !isRugged &&
                "text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400"
            )}
          >
            BETWEEN
          </h1>
          <p
            className={cn(
              "text-sm font-bold tracking-widest",
              isRugged ? "text-gray-500" : "text-gray-400"
            )}
          >
            INSTANT REFLEX GAME
          </p>
        </div>

        {/* Settings Grid */}
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            !isRugged && "bg-black/20 p-6 rounded-2xl"
          )}
        >
          {/* Difficulty */}
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-bold opacity-60">DIFFICULTY</label>
            <div className="flex gap-2">
              {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, difficulty: d }))
                  }
                  className={cn(
                    "flex-1 py-3 text-xs font-bold transition-all",
                    config.difficulty === d
                      ? isRugged
                        ? "bg-black text-white"
                        : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                      : isRugged
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white/5 text-gray-400",
                    !isRugged && "rounded-lg"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Input Mode */}
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-bold opacity-60">INPUT MODE</label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setConfig((prev) => ({ ...prev, inputMode: "KEYPAD" }))
                }
                className={cn(
                  "flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all",
                  config.inputMode === "KEYPAD"
                    ? isRugged
                      ? "bg-black text-white"
                      : "bg-purple-500 text-white shadow-lg"
                    : isRugged
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white/5 text-gray-400",
                  !isRugged && "rounded-lg"
                )}
              >
                <Keyboard size={16} /> KEYPAD
              </button>
              <button
                onClick={() =>
                  setConfig((prev) => ({ ...prev, inputMode: "VOICE" }))
                }
                className={cn(
                  "flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all",
                  config.inputMode === "VOICE"
                    ? isRugged
                      ? "bg-black text-white"
                      : "bg-pink-500 text-white shadow-lg"
                    : isRugged
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white/5 text-gray-400",
                  !isRugged && "rounded-lg"
                )}
              >
                <Mic size={16} /> VOICE
              </button>
            </div>
          </div>

          {/* UI Toggle */}
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                uiMode: prev.uiMode === "RUGGED" ? "LUXURY" : "RUGGED",
              }))
            }
            className={cn(
              "col-span-1 flex items-center justify-center gap-2 py-3 text-xs font-bold",
              isRugged
                ? "border-2 border-gray-200 text-gray-400"
                : "bg-white/10 text-white rounded-lg"
            )}
          >
            {isRugged ? <Settings size={14} /> : <Zap size={14} />}{" "}
            {config.uiMode}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                isSoundEnabled: !prev.isSoundEnabled,
              }))
            }
            className={cn(
              "col-span-1 flex items-center justify-center gap-2 py-3 text-xs font-bold",
              isRugged
                ? "border-2 border-gray-200 text-gray-400"
                : "bg-white/10 text-white rounded-lg"
            )}
          >
            {config.isSoundEnabled ? (
              <Volume2 size={14} />
            ) : (
              <VolumeX size={14} />
            )}{" "}
            SOUND
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className={cn(
            "w-full py-6 text-2xl font-black tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl",
            isRugged
              ? "bg-black text-white border-b-8 border-gray-800 active:border-b-0 active:translate-y-2"
              : "bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-2xl shadow-cyan-500/50"
          )}
        >
          START
        </button>

        <div className="text-center text-xs opacity-50">
          High Score: {highScore}
        </div>
      </div>
    </div>
  );
};
