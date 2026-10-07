'use client';

import { useState } from 'react';
import { printFeedback } from '@/lib/printFeedback';
import { InterviewResult } from '@/lib/types';
import { StarRating } from './StarRating';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface ResultsCardProps {
  result: InterviewResult;
  onPracticeAgain: () => void;
  embedded?: boolean;
}

export function ResultsCard({ result, onPracticeAgain, embedded = false }: ResultsCardProps) {
  const [exportError, setExportError] = useState<string | null>(null);
  const decisionConfig = {
    hire: {
      icon: CheckCircle,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      label: 'Strong practice performance',
    },
    'no-hire': {
      icon: XCircle,
      color: 'text-rose-300',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20',
      label: 'More practice recommended',
    },
    maybe: {
      icon: AlertCircle,
      color: 'text-amber-200',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      label: 'Keep building your evidence',
    },
  };

  const config = decisionConfig[result.decision];
  const DecisionIcon = config.icon;

  return (
    <div className={embedded ? "text-slate-100" : "app-surface min-h-dvh text-slate-100 py-10"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Your progress</p><h2 className="mt-1 text-xl font-bold">Interview feedback</h2></div>
          <button onClick={() => { setExportError(null); try { printFeedback(result); } catch (error) { setExportError(error instanceof Error ? error.message : 'Could not open the PDF report.'); } }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#172036] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"><Download className="h-4 w-4" />Save as PDF</button>
        </div>
        {exportError && <p role="alert" className="mb-4 rounded-xl bg-rose-400/10 p-3 text-rose-300">{exportError}</p>}
        <p className="mb-6 text-xs text-slate-400">Save as PDF opens a print-friendly report. Choose Save as PDF in the print dialog.</p>
        {/* Decision Header */}
        <div className={`text-center mb-6 p-6 rounded-2xl ${config.bg} border ${config.border}`}>
          <DecisionIcon className={`w-10 h-10 mx-auto mb-4 ${config.color}`} />
          <h2 className="text-2xl font-bold mb-2">{config.label}</h2>
          <p className="mb-4 text-sm text-slate-400">Practice feedback, not a hiring decision</p>
          <p className="text-slate-300 max-w-xl mx-auto">{result.reasoning}</p>
        </div>

        {/* Scores */}
        <div className="app-panel rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Performance Scores</h2>
          <div className="space-y-4">
            {Object.entries(result.scores).map(([key, value]) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <StarRating score={value} label={key} />
              </div>
            ))}
          </div>
        </div>

        <div className="app-panel rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your answers</h2>
          <div className="space-y-6">
            {result.answerRatings.map(rating => {
              const answer = result.transcript.filter(message => message.role === 'candidate')[rating.answerIndex - 1];
              return <div key={rating.answerIndex}>
                <h3 className="mb-2 font-semibold">Answer {rating.answerIndex}</h3>
                <StarRating score={rating.score} label={`Answer ${rating.answerIndex}`} />
                {answer && <p className="mt-2 text-sm text-slate-400">{answer.content}</p>}
                <p className="mt-2 text-slate-200">{rating.feedback}</p>
              </div>;
            })}
          </div>
        </div>

        {/* Strengths */}
        <div className="app-panel rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-300">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Greatest Strengths
          </h2>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-300 mt-1">•</span>
                <span className="text-slate-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="app-panel rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-amber-200">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Areas for Improvement
          </h2>
          <ul className="space-y-2">
            {result.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-200 mt-1">•</span>
                <span className="text-slate-300">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onPracticeAgain}
            className="px-8 py-3 app-primary hover:brightness-110 text-white rounded-lg font-semibold transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}