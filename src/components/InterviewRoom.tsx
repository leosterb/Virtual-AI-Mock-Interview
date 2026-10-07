'use client';

import { Role } from '@/lib/types';
import { useInterview } from '@/hooks/useInterview';
import { AIAvatar } from './AIAvatar';
import { UserVideo } from './UserVideo';
import { CallEndedModal } from './CallEndedModal';
import { Transcript } from './Transcript';
import { Controls } from './Controls';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBrand } from './AppBrand';
import { ArrowLeft, Clock } from 'lucide-react';

interface InterviewRoomProps {
  role: Role;
}

export function InterviewRoom({ role }: InterviewRoomProps) {
  const router = useRouter();
  const [timeElapsed, setTimeElapsed] = useState(0);

  const {
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
  } = useInterview();

  useEffect(() => { void startInterviewSession(role); }, [role, startInterviewSession]);

  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => setTimeElapsed(previous => previous + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = async () => {
    await endInterviewSession();
  };

  return (
    <>
    {(phase === 'ending' || phase === 'ended') && <CallEndedModal
      result={result} isGenerating={isThinking} error={phase === 'ending' ? error : null}
      onRetry={() => { void endInterviewSession(); }}
      onViewResults={() => router.push('/results')}
      onPracticeAgain={() => { sessionStorage.removeItem('interviewResult'); router.push('/'); }}
    />}
    <div inert={phase === 'ending' || phase === 'ended'} className="app-surface h-dvh text-white flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="app-header flex flex-wrap items-center justify-between gap-4 px-5 py-4 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to roles
        </button>
        <div className="hidden xl:block"><AppBrand /></div>
        <div className="text-center">
          <h1 className="font-semibold">{role.title} Interview</h1>
          <p className="text-sm text-slate-400">{role.department}</p>
        </div>
        <div className="app-secondary flex items-center gap-2 rounded-full px-3 py-2 text-sm font-mono"><Clock className="h-4 w-4 text-violet-300" />{formatTime(timeElapsed)}</div>
      </div>

      {/* Instruction banner */}
      <div className="bg-violet-400/10 border-b border-violet-400/20 px-6 py-2 text-center shrink-0">
        <p className="text-sm text-blue-300">
          {phase === 'waiting' ? 'Take a breath. Alex will begin after a 3-second pause.' : <><strong>Tip:</strong> Speak naturally. After 3 seconds of silence, your answer is sent automatically. You can also use Send answer.</>}
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-2 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 shrink-0">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0">
        {/* Video section */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <div className="min-h-60 grid grid-cols-2 gap-4 lg:flex-1 lg:min-h-0">
            {/* AI Interviewer */}
            <div className="relative">
              <AIAvatar isSpeaking={isSpeaking} isThinking={isThinking} />
            </div>
            {/* User */}
            <div className="relative">
              {phase !== 'ending' && phase !== 'ended' && <UserVideo isMuted={!isListening} />}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 shrink-0">
            <Controls
              isReady={phase === 'active'}
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
        <div className="h-80 w-full p-4 border-t lg:border-t-0 lg:border-l border-white/10 shrink-0 lg:h-auto lg:w-80">
          <Transcript messages={messages} currentTranscript={currentTranscript} />
        </div>
      </div>
    </div>
    </>
  );
}