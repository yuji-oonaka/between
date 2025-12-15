import React, { useState, useEffect, useMemo, useRef } from "react";
import { Mic, MicOff, Home } from "lucide-react";
import { cn, parseVoiceInput } from "@/lib/utils";
import { GameConfig, GameState, FeedbackState } from "@/types";
import { Keypad } from "@/components/ui/Keypad";
import { NumberPanel } from "@/components/ui/NumberPanel";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { calculateCorrectAnswer } from "@/lib/gameLogic";
import { useSound } from "@/hooks/useSound";

interface GameScreenProps {
  config: GameConfig;
  gameState: GameState;
  feedback: FeedbackState | null;
  onAnswer: (val: number) => void;
  onPass: () => void;
  onAbort: () => void;
  onStartGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  config,
  gameState,
  feedback,
  onAnswer,
  onPass,
  onAbort,
  onStartGame,
}) => {
  const [inputBuffer, setInputBuffer] = useState("");
  const isRugged = config.uiMode === "RUGGED";

  // ゴースト入力（認識されたが正解ではなかった数字を表示用）
  const [ghostInput, setGhostInput] = useState<string | null>(null);
  const ghostTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 連打防止用のクールダウン管理
  const ignoreActionUntil = useRef<number>(0);

  // サウンド
  const { playCorrect, playPass, playCount, playGo } = useSound(
    config.isSoundEnabled
  );

  // カウントダウン用 State
  const [count, setCount] = useState(3);

  // カウントダウン処理
  useEffect(() => {
    if (gameState.status === "COUNTDOWN") {
      setCount(3);
      playCount?.();
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.status]);

  // カウントダウン完了監視
  useEffect(() => {
    if (gameState.status !== "COUNTDOWN") return;
    if (count === 2 || count === 1) {
      playCount?.();
    } else if (count === 0) {
      playGo?.();
      onStartGame();
    }
  }, [count, gameState.status]);

  // 正解計算
  const currentAnswer = useMemo(() => {
    return calculateCorrectAnswer(gameState.targetA, gameState.targetB);
  }, [gameState.targetA, gameState.targetB]);

  // ゴースト表示ヘルパー
  const showGhost = (val: string) => {
    setGhostInput(val);
    if (ghostTimeoutRef.current) clearTimeout(ghostTimeoutRef.current);
    ghostTimeoutRef.current = setTimeout(() => {
      setGhostInput(null);
    }, 1000);
  };

  // Voice Control
  const isMicEnabled =
    config.inputMode === "VOICE" && gameState.status === "PLAYING";

  const { isListening, start: startMic } = useVoiceInput(
    isMicEnabled,
    (transcript) => {
      if (gameState.status !== "PLAYING") return;

      const now = Date.now();
      if (now < ignoreActionUntil.current) return;

      // 1. スキップ判定
      if (/パス|スキップ|次|ネクスト|next|skip/i.test(transcript)) {
        playPass?.();
        onPass();
        ignoreActionUntil.current = now + 1000;
        setGhostInput(null);
        return;
      }

      // 2. 数字解析
      const val = parseVoiceInput(transcript);
      if (val === "PASS") {
        playPass?.();
        onPass();
        ignoreActionUntil.current = now + 1000;
        setGhostInput(null);
      } else if (val !== null) {
        // ★ 3. 正解判定（言い直し補正付き） ★

        const valStr = val.toString();
        const ansStr = currentAnswer.toString();
        let isCorrect = false;

        if (val === currentAnswer) {
          // そのまま正解
          isCorrect = true;
        } else if (valStr.length > ansStr.length && valStr.endsWith(ansStr)) {
          // 【神対応】桁数が多くて、かつ末尾が正解と一致している場合 (例: "6465" vs "65")
          // 言い直しとみなして正解扱いにする！
          isCorrect = true;
        }

        if (isCorrect) {
          playCorrect?.();
          onAnswer(currentAnswer); // 補正後の正解を渡す
          ignoreActionUntil.current = now + 600;
          setGhostInput(null);
        } else {
          // 完全な不正解のみゴースト表示
          showGhost(val.toString());
        }
      }
    }
  );

  // Initialize Mic
  useEffect(() => {
    if (isMicEnabled) {
      startMic();
    }
  }, [isMicEnabled, startMic]);

  // Keypad Handlers
  const handleKeypadInput = (char: string) => {
    if (gameState.status !== "PLAYING") return;
    if (inputBuffer.length < 5) setInputBuffer((prev) => prev + char);
  };
  const handleKeypadEnter = () => {
    if (gameState.status !== "PLAYING") return;
    if (inputBuffer) {
      const val = parseInt(inputBuffer);
      if (val === currentAnswer) playCorrect?.();
      onAnswer(val);
      setInputBuffer("");
    }
  };
  const handleKeypadDelete = () => {
    setInputBuffer((prev) => prev.slice(0, -1));
  };
  const handleKeypadPass = () => {
    if (gameState.status !== "PLAYING") return;
    playPass?.();
    onPass();
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== "PLAYING" || config.inputMode !== "KEYPAD")
        return;

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
  }, [gameState.status, config.inputMode, inputBuffer, currentAnswer]);

  const containerStyle = isRugged
    ? "bg-white text-black font-mono selection:bg-black selection:text-white"
    : "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white font-sans";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden",
        containerStyle,
        feedback?.type === "ng" && (isRugged ? "bg-red-100" : "bg-red-900/50")
      )}
    >
      {/* カウントダウンオーバーレイ */}
      {gameState.status === "COUNTDOWN" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-9xl font-black text-white animate-bounce">
            {count > 0 ? count : "GO!"}
          </div>
        </div>
      )}

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

        {/* Input Feedback / Buffer / Ghost */}
        <div className="h-24 flex flex-col items-center justify-center w-full mb-4 relative">
          {feedback ? (
            <span
              className={cn(
                "text-5xl font-black animate-ping-once absolute",
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
            <>
              <span
                className={cn(
                  "text-5xl font-black tracking-widest border-b-4 transition-opacity",
                  inputBuffer
                    ? "border-current opacity-100"
                    : "border-transparent opacity-0"
                )}
              >
                {inputBuffer}
              </span>

              {/* Ghost Input (薄く表示) */}
              {!inputBuffer && ghostInput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold opacity-30 animate-pulse scale-90 text-gray-400">
                    {ghostInput}?
                  </span>
                </div>
              )}
            </>
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
              onPass={handleKeypadPass}
              disabled={!!feedback || gameState.status !== "PLAYING"}
            />
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-2xl transition-all",
                isListening
                  ? isRugged
                    ? "bg-red-100 text-red-600"
                    : "bg-red-500/20 text-red-200 animate-pulse"
                  : "opacity-50"
              )}
            >
              {isListening ? <Mic size={48} /> : <MicOff size={48} />}
              <span className="mt-4 font-bold text-sm tracking-widest">
                {gameState.status === "COUNTDOWN"
                  ? "READY..."
                  : isListening
                  ? "LISTENING..."
                  : "PAUSED"}
              </span>
              <p className="mt-2 text-xs opacity-60">"パス" でスキップ</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={onAbort}
        className="mt-8 flex items-center gap-2 text-xs font-bold opacity-30 hover:opacity-100 transition-opacity"
      >
        <Home size={14} /> ABORT GAME
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
