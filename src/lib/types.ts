export type InterviewPhase = 'setup' | 'waiting' | 'active' | 'ended';

export interface Role {
  id: string;
  title: string;
  description: string;
  difficulty: 'entry' | 'mid' | 'senior';
  department: string;
  skills: string[];
}

export interface Message {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export interface InterviewScores {
  communication: number;
  technical: number;
  problemSolving: number;
  culturalFit: number;
  overall: number;
}

export interface InterviewResult {
  decision: 'hire' | 'no-hire' | 'maybe';
  reasoning: string;
  scores: InterviewScores;
  strengths: string[];
  improvements: string[];
  transcript: Message[];
}

export interface InterviewState {
  phase: InterviewPhase;
  role: Role | null;
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  error: string | null;
}