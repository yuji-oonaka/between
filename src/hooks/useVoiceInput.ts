import { useState, useEffect, useRef, useCallback } from 'react';
import { parseVoiceInput } from '@/lib/utils';

interface UseVoiceInputReturn {
  isListening: boolean;
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

export const useVoiceInput = (
  isEnabled: boolean,
  onResult: (val: number | 'PASS') => void
): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        const parsed = parseVoiceInput(transcript);
        
        if (parsed !== null) {
          onResultRef.current(parsed);
        }
      }
    };

    recognition.onend = () => {
      if (isEnabled && recognitionRef.current) {
        try { 
          recognitionRef.current.start(); 
        } catch (e) { 
          // 既に開始されている場合の対策
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isEnabled]); // isEnabledの変更で再初期化はしないが、onEndの挙動に影響

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch(e) { /* ignore */ }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isListening, start, stop, isSupported };
};