import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

export const useVoiceInput = (
  isEnabled: boolean,
  onResult: (transcript: string) => void
): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // インスタンス管理用
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const isMountedRef = useRef(true);

  // コールバックを常に最新に保つ
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // マウント状態の管理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 音声認識のセットアップ（isEnabledが変わるたび、つまりゲーム開始/終了ごとに実行）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // 1. 新しいインスタンスを作成
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';
    recognition.maxAlternatives = 1;

    // 文法設定 (Chrome用)
    // @ts-ignore
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    if (SpeechGrammarList) {
      const speechRecognitionList = new SpeechGrammarList();
      const grammar = '#JSGF V1.0; grammar numbers; public <number> = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 100 | パス | スキップ ;';
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    // イベントハンドラ
    recognition.onresult = (event: any) => {
      if (!isMountedRef.current) return;
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult || !lastResult[0]) return;
      const text = lastResult[0].transcript;
      onResultRef.current?.(text);
    };

    recognition.onstart = () => {
      if (isMountedRef.current) setIsListening(true);
    };

    recognition.onend = () => {
      if (isMountedRef.current) setIsListening(false);
      // isEnabledがtrueのまま停止した場合は、少し待ってから再起動（ループ維持）
      if (isMountedRef.current && isEnabled) {
        setTimeout(() => {
          if (isMountedRef.current && isEnabled && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
      // abortedなどは無視
    };

    recognitionRef.current = recognition;

    // 2. 開始処理（ここが修正ポイント）
    let startTimer: NodeJS.Timeout;
    
    if (isEnabled) {
      // 即座にstart()せず、前の画面のクリーンアップ待ちとして 150ms 遅延させる
      // これにより「リトライ時に認識しない」問題を解決します
      startTimer = setTimeout(() => {
        if (isMountedRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Voice start failed (retry safe):", e);
          }
        }
      }, 150);
    }

    // 3. クリーンアップ処理
    return () => {
      clearTimeout(startTimer);
      if (recognition) {
        // stop() ではなく abort() を使うことで、プロセスを強制キルして次のゲームに備える
        try { recognition.abort(); } catch (e) {}
      }
      recognitionRef.current = null;
    };
  }, [isEnabled]); // isEnabled (ゲームのON/OFF) が変わるたびにリセットがかかる

  // 手動コントロール用
  const start = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  }, []);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
  }, []);

  return { isListening, start, stop, isSupported };
};