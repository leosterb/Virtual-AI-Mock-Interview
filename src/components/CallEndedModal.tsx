'use client';

import { useEffect, useRef } from 'react';
import { Loader2, PhoneOff } from 'lucide-react';
import { InterviewResult } from '@/lib/types';
import { ResultsCard } from './ResultsCard';

interface CallEndedModalProps {
  result: InterviewResult | null;
  isGenerating: boolean;
  error: string | null;
  onRetry: () => void;
  onViewResults: () => void;
  onPracticeAgain: () => void;
}

export function CallEndedModal({ result, isGenerating, error, onRetry, onViewResults, onPracticeAgain }: CallEndedModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return <dialog ref={dialogRef} aria-labelledby="call-ended-title" onCancel={event => event.preventDefault()}
    className="m-auto max-h-[90vh] w-[min(95vw,56rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
    <header className="mb-6 text-center">
      <PhoneOff aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-rose-600" />
      <h1 id="call-ended-title" className="text-3xl font-bold">Call ended</h1>
      <p className="mt-2 text-slate-500">Your microphone, camera, and interviewer audio are stopped.</p>
    </header>
    <div aria-live="polite">
      {isGenerating ? <><p className="flex items-center justify-center gap-3 py-8"><Loader2 className="h-5 w-5 animate-spin" />Your AI provider is preparing feedback from your answers...</p>
          <button className="w-full rounded-lg border border-slate-200 p-3" onClick={onPracticeAgain}>Back to roles</button></>
        : result ? <>
          <ResultsCard result={result} onPracticeAgain={onPracticeAgain} embedded />
          <button className="mt-4 w-full rounded-lg border border-slate-200 p-3" onClick={onViewResults}>Open full results page</button>
        </>
        : error ? <div className="space-y-4">
          <p role="alert" className="text-rose-700">{error}</p>
          <button className="rounded-lg bg-teal-700 text-white px-4 py-3" onClick={onRetry}>Retry feedback</button>
          <button className="ml-4 rounded-lg border border-slate-200 px-4 py-3" onClick={onPracticeAgain}>Back to roles</button>
        </div>
        : <div className="space-y-4 text-center">
          <p>No answers were recorded, so there isn&apos;t enough information to generate ratings. Start another interview when you&apos;re ready.</p>
          <button className="rounded-lg bg-teal-700 text-white px-4 py-3" onClick={onPracticeAgain}>Back to roles</button>
        </div>}
    </div>
  </dialog>;
}
