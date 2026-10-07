'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = useSyncExternalStore(subscribe,
    () => 'speechSynthesis' in window, () => false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const pendingRef = useRef<((spoken: boolean) => void) | null>(null);

  const stop = useCallback(() => {
    const settle = pendingRef.current;
    pendingRef.current = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    settle?.(false);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      const settle = pendingRef.current;
      pendingRef.current = null;
      window.speechSynthesis.cancel();
      settle?.(false);
    };
  }, []);

  const speak = useCallback((text: string): Promise<boolean> => {
    stop();
    return new Promise(resolve => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(false); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
      const keywords = ['zira', 'samantha', 'female', 'woman'];
      utterance.voice = keywords.map(keyword => voices.find(voice => voice.name.toLowerCase().includes(keyword)))
        .find(Boolean) ?? voices.find(voice => voice.lang.startsWith('en')) ?? voices[0] ?? null;
      // Cancellation does not reliably fire onend in every browser.
      let finished = false;
      const settle = (spoken: boolean) => {
        if (finished) return;
        finished = true;
        clearTimeout(watchdog);
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        if (pendingRef.current === settle) pendingRef.current = null;
        setIsSpeaking(false);
        resolve(spoken);
      };
      const watchdog = setTimeout(() => {
        settle(false);
        window.speechSynthesis.cancel();
      }, Math.max(15000, text.length * 150));
      pendingRef.current = settle;
      setIsSpeaking(true);
      utterance.onend = () => settle(true);
      utterance.onerror = () => settle(false);
      try { window.speechSynthesis.speak(utterance); } catch { settle(false); }
    });
  }, [stop]);

  return { speak, stop, isSpeaking, isSupported };
}
