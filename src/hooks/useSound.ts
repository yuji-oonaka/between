import { useCallback, useRef, useEffect } from 'react';

export const useSound = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [enabled]);

  // 正解音: ピコン！
  const playCorrect = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [enabled]);

  // パス音
  const playPass = useCallback(() => playTone(400, 'triangle', 0.15, 0.2), [playTone]);

  // カウントダウン (3, 2, 1)
  const playCount = useCallback(() => playTone(800, 'sine', 0.1, 0.2), [playTone]);
  
  // カウントダウン (GO!)
  const playGo = useCallback(() => playTone(1600, 'square', 0.4, 0.2), [playTone]);

  return { playCorrect, playPass, playCount, playGo };
};