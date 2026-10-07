'use client';

import { InterviewResult } from '@/lib/types';
import { StarRating } from './StarRating';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ResultsCardProps {
  result: InterviewResult;
  onPracticeAgain: () => void;
  embedded?: boolean;
}

export function ResultsCard({ result, onPracticeAgain, embedded = false }: ResultsCardProps) {
  const decisionConfig = {
    hire: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500',
      label: 'Strong practice performance',
    },
    'no-hire': {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      label: 'More practice recommended',
    },
    maybe: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      label: 'Keep building your evidence',
    },
  };

  const config = decisionConfig[result.decision];
  const DecisionIcon = config.icon;

  return (
    <div className={embedded ? "text-white" : "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16"}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Decision Header */}
        <div className={`text-center mb-12 p-8 rounded-xl ${config.bg} border ${config.border}`}>
          <DecisionIcon className={`w-20 h-20 mx-auto mb-4 ${config.color}`} />
          <h2 className="text-2xl font-bold mb-2">{config.label}</h2>
          <p className="mb-4 text-sm text-slate-400">Practice feedback, not a hiring decision</p>
          <p className="text-slate-300 max-w-xl mx-auto">{result.reasoning}</p>
        </div>

        {/* Scores */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
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

        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
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
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Greatest Strengths
          </h2>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-slate-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Areas for Improvement
          </h2>
          <ul className="space-y-2">
            {result.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span className="text-slate-300">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onPracticeAgain}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}