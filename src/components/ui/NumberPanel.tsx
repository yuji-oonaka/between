import React from "react";
import { cn } from "@/lib/utils";
import { UIMode } from "@/types";

interface NumberPanelProps {
  a: number;
  b: number;
  uiMode: UIMode;
}

export const NumberPanel: React.FC<NumberPanelProps> = ({ a, b, uiMode }) => {
  const isRugged = uiMode === "RUGGED";

  return (
    <div
      className={cn(
        "flex items-center gap-4 sm:gap-8 mb-8 transition-all",
        isRugged
          ? "border-4 border-black p-8 bg-white"
          : "bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl"
      )}
    >
      <div className="text-6xl sm:text-7xl font-black tracking-tighter">
        {a}
      </div>
      <div
        className={cn(
          "text-4xl opacity-30 font-light",
          !isRugged && "animate-pulse"
        )}
      >
        —
      </div>
      <div className="text-6xl sm:text-7xl font-black tracking-tighter">
        {b}
      </div>
    </div>
  );
};
