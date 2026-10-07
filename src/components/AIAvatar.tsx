'use client';

import { User, Loader2 } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
}

export function AIAvatar({ isSpeaking, isThinking }: AIAvatarProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/15 rounded-2xl border border-violet-400/20 flex items-center justify-center">
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-purple-500/20 rounded-xl animate-pulse" />
      )}

      {/* Avatar container */}
      <div className={`relative z-10 ${isSpeaking ? 'scale-105' : ''} transition-transform duration-300`}>
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ${isSpeaking ? 'ring-4 ring-purple-400/50' : ''}`}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Speaking waves */}
        {isSpeaking && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-6 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-1 h-5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            <div className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Name label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/70 text-sm">
        {isThinking ? 'Thinking...' : isSpeaking ? 'Speaking' : 'Alex (Interviewer)'}
      </div>
    </div>
  );
}