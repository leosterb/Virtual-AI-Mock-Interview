'use client';

import { Role } from '@/lib/types';
import { useInterview } from '@/hooks/useInterview';
import { AIAvatar } from './AIAvatar';
import { UserVideo } from './UserVideo';
import { Transcript } from './Transcript';
import { Controls } from './Controls';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface InterviewRoomProps {
  role: Role;
}

export function InterviewRoom({ role }: InterviewRoomProps) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const hasStartedRef = useRef(false);

  const {
    phase,
    messages,
    currentTranscript,
    isListening,
    isSpeaking,
    isThinking,
    error,
    startInterviewSession,
    submitResponse,
    startListening,
    stopListening,
    endInterviewSession,
  } = useInterview();

  // Start interview on mount (only once)
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startInterviewSession(role);
    }
  }, [role, startInterviewSession]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = async () => {
    await endInterviewSession();
    router.push('/results');
  };

  if (phase === 'ended') {
    router.push('/results');
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit
        </button>
        <div className="text-center">
          <h1 className="font-semibold">{role.title} Interview</h1>
          <p className="text-sm text-slate-400">{role.department}</p>
        </div>
        <div className="text-2xl font-mono">{formatTime(timeElapsed)}</div>
      </div>

      {/* Instruction banner */}
      <div className="bg-blue-500/20 border-b border-blue-500/30 px-6 py-2 text-center shrink-0">
        <p className="text-sm text-blue-300">
          <strong>Tip:</strong> Just speak naturally. After you pause for 3 seconds, your response will be sent automatically.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-2 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 shrink-0">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Video section */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            {/* AI Interviewer */}
            <div className="relative">
              <AIAvatar isSpeaking={isSpeaking} isThinking={isThinking} />
            </div>
            {/* User */}
            <div className="relative">
              <UserVideo isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 shrink-0">
            <Controls
              isListening={isListening}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              hasTranscript={currentTranscript.length > 0}
              onStartListening={startListening}
              onStopListening={stopListening}
              onSubmitResponse={submitResponse}
              onEndInterview={handleEndInterview}
            />
          </div>
        </div>

        {/* Transcript sidebar */}
        <div className="w-80 p-4 border-l border-slate-700 shrink-0">
          <Transcript messages={messages} currentTranscript={currentTranscript} />
        </div>
      </div>
    </div>
  );
}