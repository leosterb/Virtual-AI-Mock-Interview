'use client';

import { Message } from '@/lib/types';
import { User, Bot } from 'lucide-react';

interface TranscriptProps {
  messages: Message[];
  currentTranscript: string;
}

export function Transcript({ messages, currentTranscript }: TranscriptProps) {
  return (
    <div className="h-full flex flex-col app-panel rounded-2xl">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold text-white">Transcript</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentTranscript && (
          <p className="text-slate-500 text-sm text-center py-8">
            Conversation will appear here...
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'candidate' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'interviewer'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-slate-600'
              }`}
            >
              {message.role === 'interviewer' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`flex-1 p-3 rounded-lg ${
                message.role === 'interviewer'
                  ? 'bg-white/5'
                  : 'bg-indigo-500/20'
              }`}
            >
              <p className="text-sm text-slate-200">{message.content}</p>
              <span className="text-xs text-slate-500 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Current speaking transcript */}
        {currentTranscript && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 p-3 rounded-lg bg-indigo-500/20">
              <p className="text-sm text-slate-200">{currentTranscript}</p>
              <span className="text-xs text-blue-400 mt-1 block animate-pulse">
                Speaking...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}