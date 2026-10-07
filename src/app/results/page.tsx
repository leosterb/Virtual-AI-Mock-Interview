'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewResult } from '@/lib/types';
import { parseEvaluation } from '@/lib/claude';
import { useSessionValue } from '@/hooks/useSessionValue';
import { ResultsCard } from '@/components/ResultsCard';

export default function ResultsPage() {
  const router = useRouter();
  const { value, hydrated } = useSessionValue('interviewResult');
  const result = useMemo<InterviewResult | null>(() => {
    try {
      if (!value) return null;
      const parsed = JSON.parse(value) as InterviewResult;
      const validated = parseEvaluation(value);
      validated.transcript = (parsed.transcript || []).map(message => ({ ...message, timestamp: new Date(message.timestamp) }));
      return validated;
    } catch { return null; }
  }, [value]);
  useEffect(() => { if (hydrated && !result) router.replace('/'); }, [hydrated, result, router]);

  if (!result) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="text-xl">Loading results...</div>
    </div>
  );
  return <ResultsCard result={result} onPracticeAgain={() => {
    sessionStorage.removeItem('interviewResult');
    router.push('/');
  }} />;
}
