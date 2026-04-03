'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewResult } from '@/lib/types';
import { ResultsCard } from '@/components/ResultsCard';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    // Get interview result from sessionStorage
    const resultData = sessionStorage.getItem('interviewResult');
    if (resultData) {
      try {
        const parsedResult = JSON.parse(resultData) as InterviewResult;
        // Convert timestamp strings back to Date objects
        if (parsedResult.transcript) {
          parsedResult.transcript = parsedResult.transcript.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
        setResult(parsedResult);
        // Clear the result from sessionStorage after reading
        sessionStorage.removeItem('interviewResult');
      } catch {
        console.error('Failed to parse interview result');
        router.push('/');
      }
    } else {
      // No result found, redirect to home
      router.push('/');
    }
  }, [router]);

  const handlePracticeAgain = () => {
    router.push('/');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  return <ResultsCard result={result} onPracticeAgain={handlePracticeAgain} />;
}