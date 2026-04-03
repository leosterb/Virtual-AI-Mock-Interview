'use client';

import { Mic, MicOff, PhoneOff, Clock, Loader2 } from 'lucide-react';

interface ControlsProps {
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  hasTranscript: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitResponse: () => void;
  onEndInterview: () => void;
}

export function Controls({
  isListening,
  isThinking,
  isSpeaking,
  hasTranscript,
  onStartListening,
  onStopListening,
  onSubmitResponse,
  onEndInterview,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
      {/* Mic toggle */}
      <button
        onClick={isListening ? onStopListening : onStartListening}
        disabled={isThinking || isSpeaking}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? 'Stop listening' : 'Start speaking'}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg min-w-[200px] justify-center">
        {isThinking ? (
          <>
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-sm text-yellow-300">Alex is thinking...</span>
          </>
        ) : isSpeaking ? (
          <>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-sm text-purple-300">Alex is speaking...</span>
          </>
        ) : isListening ? (
          hasTranscript ? (
            <>
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Auto-sending in 3s...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-300">Listening... speak now</span>
            </>
          )
        ) : (
          <>
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-sm text-slate-400">Waiting for Alex...</span>
          </>
        )}
      </div>

      {/* End interview */}
      <button
        onClick={onEndInterview}
        disabled={isThinking}
        className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="End interview"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
}