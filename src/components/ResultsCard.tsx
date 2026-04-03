'use client';

import { InterviewResult } from '@/lib/types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ResultsCardProps {
  result: InterviewResult;
  onPracticeAgain: () => void;
}

export function ResultsCard({ result, onPracticeAgain }: ResultsCardProps) {
  const decisionConfig = {
    hire: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500',
      label: 'HIRED',
    },
    'no-hire': {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      label: 'NOT HIRED',
    },
    maybe: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      label: 'MAYBE',
    },
  };

  const config = decisionConfig[result.decision];
  const DecisionIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Decision Header */}
        <div className={`text-center mb-12 p-8 rounded-xl ${config.bg} border ${config.border}`}>
          <DecisionIcon className={`w-20 h-20 mx-auto mb-4 ${config.color}`} />
          <h1 className="text-4xl font-bold mb-2">{config.label}</h1>
          <p className="text-slate-300 max-w-xl mx-auto">{result.reasoning}</p>
        </div>

        {/* Scores */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">Performance Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(result.scores).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className={value >= 7 ? 'text-green-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400'}
                      strokeDasharray={`${value * 22} 220`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {value}
                  </span>
                </div>
                <span className="text-sm text-slate-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
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