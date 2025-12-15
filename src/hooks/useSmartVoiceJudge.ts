import { useRef, useCallback, useEffect } from 'react';

/**
 * 音声認識の「早とちり」を防ぐための判定ロジック
 * 正解 -> 即座に反応 (0秒)
 * 不正解 -> 少し待って、言い直しがなければ確定 (0.4秒待機)
 */
export const useSmartVoiceJudge = (
  correctAnswer: number,        // 現在の正解 (ターゲット)
  onJudge: (ans: number) => void // 判定確定後に実行する関数 (handleAnswer)
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputRef = useRef<number | null>(null);
  
  // 問題が変わったらリセット
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    lastInputRef.current = null;
  }, [correctAnswer]);

  const processInput = useCallback((inputVal: number) => {
    // 既に正解判定済みなら何もしない
    if (timerRef.current === null && lastInputRef.current === correctAnswer) {
      return;
    }

    // A. 正解の場合 → 待ったなしで即実行 (最速レスポンス)
    if (inputVal === correctAnswer) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastInputRef.current = inputVal;
      onJudge(inputVal);
      return;
    }

    // B. 不正解の場合 → 少し様子を見る (言いかけの可能性があるため)
    // 既にタイマーが動いているなら、最新の「間違い候補」を更新して待機継続
    // ここでは「最初の誤検知から待つ」のではなく「入力があるたびに0.4秒待つ」デバウンス処理にします
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 0.4秒間、新しい入力がなければ「それがファイナルアンサーだ」とみなしてLOCKする
    timerRef.current = setTimeout(() => {
      onJudge(inputVal);
      timerRef.current = null;
    }, 400); // ここの数値を増やすと誤判定は減るが、間違い確定のラグが増える
    
  }, [correctAnswer, onJudge]);

  return { processInput };
};