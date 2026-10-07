'use client';

import { Mic, MicOff, PhoneOff, Clock, Loader2, Send } from 'lucide-react';

interface ControlsProps {
  isReady: boolean;
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
  isReady,
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
    <div className="flex flex-wrap items-center justify-center gap-4 app-panel p-4 rounded-2xl">
      {/* Mic toggle */}
      <button
        onClick={isListening ? onStopListening : onStartListening}
        disabled={!isReady || isThinking || isSpeaking}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'app-primary hover:brightness-110 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? 'Stop listening' : 'Start speaking'}
        aria-label={isListening ? 'Stop listening' : 'Start speaking'}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg min-w-[200px] justify-center">
        {!isReady ? <span className="text-sm text-blue-300">Getting ready...</span> : isThinking ? (
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

      <button onClick={onSubmitResponse} disabled={!isReady || !hasTranscript || isThinking || isSpeaking}
        className="app-primary rounded-xl px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send answer">
        <Send className="mr-2 inline h-4 w-4" />Send answer
      </button>

      {/* End interview */}
      <button
        onClick={onEndInterview}
        disabled={!isReady || isThinking}
        className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="End interview"
        aria-label="End interview"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
}