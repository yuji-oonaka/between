import React from "react";
import { cn } from "@/lib/utils";
import { UIMode } from "@/types";

interface KeypadProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  onPass: () => void;
  disabled: boolean;
  uiMode: UIMode;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onDelete,
  onEnter,
  onPass,
  disabled,
  uiMode,
}) => {
  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];
  const isRugged = uiMode === "RUGGED";

  const baseClass = isRugged
    ? "bg-gray-200 text-black border-b-4 border-gray-400 hover:bg-gray-300 active:border-b-0 active:translate-y-1"
    : "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 active:scale-95";

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto mt-4">
      {keys.map((k) => (
        <button
          key={k}
          disabled={disabled}
          onClick={() => onInput(k)}
          className={cn(
            "h-16 text-2xl font-bold rounded-xl transition-all",
            baseClass,
            k === "0" && "col-span-1"
          )}
        >
          {k}
        </button>
      ))}
      <button
        onClick={onDelete}
        className={cn(
          "h-16 text-xl font-bold rounded-xl transition-all text-red-500",
          baseClass.replace("text-white", "")
        )}
      >
        DEL
      </button>
      <button
        onClick={onEnter}
        className={cn(
          "h-16 col-span-1 text-xl font-bold rounded-xl transition-all bg-blue-500 text-white shadow-blue-700/50",
          isRugged
            ? "border-b-4 border-blue-700 active:border-b-0"
            : "shadow-lg bg-linear-to-r from-blue-500 to-indigo-500"
        )}
      >
        GO
      </button>
      <button
        onClick={onPass}
        className={cn(
          "h-16 col-span-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all opacity-70 hover:opacity-100",
          uiMode === "LUXURY"
            ? "text-white/60 hover:bg-white/10"
            : "text-gray-500 hover:bg-gray-200"
        )}
      >
        PASS (-0.5s)
      </button>
    </div>
  );
};
