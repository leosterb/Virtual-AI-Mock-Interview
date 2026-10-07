'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Role, Message, InterviewResult, InterviewPhase } from '@/lib/types';
import { startInterview, processResponse, endInterview } from '@/lib/claude';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

function speechText(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1').replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ').trim();
}

function openingPause(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => { clearTimeout(timer); reject(new DOMException('Canceled', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, 3000);
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
  });
}

export function useInterview() {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const {
    transcript: currentTranscript, isListening, error: recognitionError,
    startListening, stopListening, resetTranscript,
  } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();
  const requestRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const evaluatingRef = useRef(false);

  useEffect(() => () => { requestRef.current?.abort(); }, []);

  const startInterviewSession = useCallback(async (role: Role) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    busyRef.current = true;
    evaluatingRef.current = false;
    setError(null);
    setMessages([]);
    setResult(null);
    setPhase('waiting');
    setIsThinking(true);
    try {
      // Cancelable: navigating away during the pause must never start speech.
      await openingPause(controller.signal);
      const opening = await startInterview(role);
      controller.signal.throwIfAborted();
      setMessages([{ id: crypto.randomUUID(), role: 'interviewer', content: opening, timestamp: new Date() }]);
      setPhase('active');
      setIsThinking(false);
      const spoken = await speak(speechText(opening));
      controller.signal.throwIfAborted();
      if (spoken) startListening();
      else setError('Audio could not play. Read the question and click Start speaking to answer.');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setPhase('setup');
    } finally {
      if (!controller.signal.aborted) { busyRef.current = false; setIsThinking(false); }
    }
  }, [speak, startListening]);

  const submitResponse = useCallback(async () => {
    const answer = currentTranscript.trim();
    if (!answer || busyRef.current || phase !== 'active') return;
    const controller = new AbortController();
    requestRef.current = controller;
    busyRef.current = true;
    stopListening();
    setError(null);
    setIsThinking(true);
    try {
      const response = await processResponse(answer, controller.signal);
      controller.signal.throwIfAborted();
      setMessages(previous => [...previous,
        { id: crypto.randomUUID(), role: 'candidate', content: answer, timestamp: new Date() },
        { id: crypto.randomUUID(), role: 'interviewer', content: response, timestamp: new Date() },
      ]);
      resetTranscript();
      setIsThinking(false);
      const spoken = await speak(speechText(response));
      controller.signal.throwIfAborted();
      if (spoken) startListening();
      else setError('Audio could not play. Read the question and click Start speaking to answer.');
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Failed to process response');
      // Keep the transcript so Send answer can retry without losing it.
    } finally {
      if (!controller.signal.aborted) { busyRef.current = false; setIsThinking(false); }
    }
  }, [currentTranscript, phase, resetTranscript, speak, startListening, stopListening]);

  // Includes interim recognition updates: a long answer should not submit mid-sentence.
  useEffect(() => {
    if (phase !== 'active' || isThinking || isSpeaking || error || !currentTranscript.trim()) return;
    const timer = setTimeout(() => { void submitResponse(); }, 3000);
    return () => clearTimeout(timer);
  }, [currentTranscript, error, isThinking, isSpeaking, phase, submitResponse]);

  const endInterviewSession = useCallback(async (): Promise<boolean> => {
    if (evaluatingRef.current || (phase !== 'active' && phase !== 'ending') || isThinking) return false;
    evaluatingRef.current = true;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    busyRef.current = true;
    stopSpeaking();
    stopListening();
    setPhase('ending');
    setIsThinking(true);
    setError(null);
    try {
      const answer = currentTranscript.trim();
      if (!answer && !messages.some(message => message.role === 'candidate')) {
        sessionStorage.removeItem('interviewResult');
        setPhase('ended');
        return true;
      }
      const interviewResult = await endInterview(answer, controller.signal);
      controller.signal.throwIfAborted();
      interviewResult.transcript = answer ? [...messages,
        { id: crypto.randomUUID(), role: 'candidate', content: answer, timestamp: new Date() },
      ] : messages;
      sessionStorage.setItem('interviewResult', JSON.stringify(interviewResult));
      resetTranscript();
      setResult(interviewResult);
      setPhase('ended');
      return true;
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Failed to end interview');
      return false;
    } finally {
      if (requestRef.current === controller) evaluatingRef.current = false;
      if (!controller.signal.aborted) { busyRef.current = false; setIsThinking(false); }
    }
  }, [currentTranscript, isThinking, messages, phase, resetTranscript, stopListening, stopSpeaking]);

  return {
    phase, messages, currentTranscript, isListening, isSpeaking, isThinking,
    error: error || recognitionError, result, startInterviewSession, submitResponse,
    startListening, stopListening, endInterviewSession,
  };
}
