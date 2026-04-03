'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Role, Message, InterviewResult, InterviewPhase } from '@/lib/types';
import { startInterview, processResponse, endInterview } from '@/lib/claude';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

interface UseInterviewReturn {
  phase: InterviewPhase;
  messages: Message[];
  currentTranscript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  error: string | null;
  result: InterviewResult | null;
  startInterviewSession: (role: Role) => Promise<void>;
  submitResponse: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  endInterviewSession: () => Promise<void>;
}

export function useInterview(): UseInterviewReturn {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const {
    transcript: currentTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  const prevIsSpeakingRef = useRef(false);

  // Auto-start listening when AI finishes speaking
  useEffect(() => {
    if (prevIsSpeakingRef.current && !isSpeaking && !isThinking && phase === 'active' && !isSubmittingRef.current) {
      console.log('AI finished speaking, starting listener');
      setTimeout(() => {
        startListening();
      }, 500);
    }
    prevIsSpeakingRef.current = isSpeaking;
  }, [isSpeaking, isThinking, phase, startListening]);

  // Auto-submit after 3 seconds of no transcript change
  useEffect(() => {
    // Clear existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Don't start timer if not listening, thinking, speaking, or submitting
    if (!isListening || isThinking || isSpeaking || isSubmittingRef.current) {
      return;
    }

    const transcriptTrimmed = currentTranscript.trim();

    // Only start timer if there's content
    if (!transcriptTrimmed) {
      return;
    }

    console.log('Transcript changed, starting 3s silence timer');

    // Start 3 second timer - if transcript doesn't change, auto-submit
    silenceTimerRef.current = setTimeout(() => {
      console.log('Silence timer fired! Checking if should submit...');
      console.log('isListening:', isListening, 'isThinking:', isThinking, 'isSpeaking:', isSpeaking, 'isSubmitting:', isSubmittingRef.current);

      if (!isSubmittingRef.current && !isThinking && !isSpeaking) {
        console.log('Auto-submitting now!');
        submitResponse();
      }
    }, 3000);

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [currentTranscript, isListening, isThinking, isSpeaking]);

  const startInterviewSession = useCallback(async (role: Role) => {
    console.log('Starting interview session for:', role.title);
    setError(null);
    setMessages([]);
    setResult(null);
    setCurrentRole(role);
    setPhase('waiting');
    setIsThinking(true);
    isSubmittingRef.current = false;

    try {
      const opening = await startInterview(role);
      console.log('Got opening:', opening);

      const interviewerMessage: Message = {
        id: crypto.randomUUID(),
        role: 'interviewer',
        content: opening,
        timestamp: new Date(),
      };

      setMessages([interviewerMessage]);
      setPhase('active');
      setIsThinking(false);

      const cleanOpening = opening.replace(/\*\*?\*/g, '').replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/#{1,6}\s/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ').trim();

      console.log('Speaking opening...');
      await speak(cleanOpening);
      console.log('Finished speaking opening');

    } catch (err) {
      console.error('Start interview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setPhase('setup');
      setIsThinking(false);
    }
  }, [speak]);

  const submitResponse = useCallback(async () => {
    const transcriptTrimmed = currentTranscript.trim();
    console.log('submitResponse called with:', transcriptTrimmed);

    if (!transcriptTrimmed) {
      console.log('No transcript, returning');
      return;
    }

    if (isSubmittingRef.current) {
      console.log('Already submitting, returning');
      return;
    }

    isSubmittingRef.current = true;
    console.log('Setting isSubmitting to true');

    // Stop everything immediately
    stopListening();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    resetTranscript();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'candidate',
      content: transcriptTrimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      console.log('Calling processResponse...');
      const response = await processResponse(transcriptTrimmed);
      console.log('Got response:', response);

      const cleanResponse = response.replace(/\*\*?\*/g, '').replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/#{1,6}\s/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ').trim();

      const interviewerMessage: Message = {
        id: crypto.randomUUID(),
        role: 'interviewer',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, interviewerMessage]);
      setIsThinking(false);
      isSubmittingRef.current = false;

      console.log('Speaking response...');
      await speak(cleanResponse);
      console.log('Finished speaking response');

    } catch (err) {
      console.error('Submit response error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process response');
      setIsThinking(false);
      isSubmittingRef.current = false;
    }
  }, [currentTranscript, resetTranscript, speak, stopListening]);

  const endInterviewSession = useCallback(async () => {
    stopSpeaking();
    stopListening();
    setIsThinking(true);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    try {
      if (currentTranscript.trim()) {
        const finalMessage: Message = {
          id: crypto.randomUUID(),
          role: 'candidate',
          content: currentTranscript.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, finalMessage]);
      }

      const interviewResult = await endInterview();
      interviewResult.transcript = messages;

      sessionStorage.setItem('interviewResult', JSON.stringify(interviewResult));

      setResult(interviewResult);
      setPhase('ended');
      setIsThinking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end interview');
      setIsThinking(false);
    }
  }, [currentTranscript, messages, stopListening, stopSpeaking]);

  return {
    phase,
    messages,
    currentTranscript,
    isListening,
    isSpeaking,
    isThinking,
    error,
    result,
    startInterviewSession,
    submitResponse,
    startListening,
    stopListening,
    endInterviewSession,
  };
}