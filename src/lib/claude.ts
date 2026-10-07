import { Role, InterviewResult } from './types';
import { getSystemPrompt, getOpeningMessage } from './interviewPrompts';

import { callProvider, getProviderSettings } from './providers';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

let conversationHistory: ConversationMessage[] = [];
let systemPrompt: string = '';

export async function startInterview(role: Role): Promise<string> {
  if (!getProviderSettings()) throw new Error('Choose an AI provider and enter your API key on the home page.');
  conversationHistory = [];
  systemPrompt = getSystemPrompt(role);

  // Use predefined opening message for consistency
  const openingContent = getOpeningMessage(role);

  conversationHistory.push({
    role: 'assistant',
    content: openingContent,
  });

  return openingContent;
}

export async function processResponse(userMessage: string): Promise<string> {
  console.log('Processing user message:', userMessage);

  conversationHistory.push({
    role: 'user',
    content: userMessage,
  });

  // Build messages array with system prompt and conversation history
  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];

  try {
    const assistantContent = await callProvider(messages, 500);
    console.log('Assistant response:', assistantContent);

    conversationHistory.push({
      role: 'assistant',
      content: assistantContent,
    });

    return assistantContent;
  } catch (error) {
    console.error('Error in processResponse:', error);
    throw error;
  }
}

export async function endInterview(): Promise<InterviewResult> {
  conversationHistory.push({
    role: 'user',
    content: 'The interview is now complete. Please provide your final evaluation in the JSON format specified.',
  });

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];

  const evaluationText = await callProvider(messages, 1024);

  const result = parseEvaluation(evaluationText);

  return result;
}

function parseEvaluation(text: string): InterviewResult {
  const defaultResult: InterviewResult = {
    decision: 'maybe',
    reasoning: 'Unable to parse evaluation.',
    scores: {
      communication: 5,
      technical: 5,
      problemSolving: 5,
      culturalFit: 5,
      overall: 5,
    },
    strengths: ['Completed the interview'],
    improvements: ['Practice more interviews'],
    transcript: [],
  };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        decision: parsed.decision || 'maybe',
        reasoning: parsed.reasoning || '',
        scores: {
          communication: parsed.scores?.communication || 5,
          technical: parsed.scores?.technical || 5,
          problemSolving: parsed.scores?.problemSolving || 5,
          culturalFit: parsed.scores?.culturalFit || 5,
          overall: parsed.scores?.overall || 5,
        },
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        transcript: [],
      };
    }
  } catch (error) {
    console.error('Error parsing evaluation:', error);
  }

  return defaultResult;
}

export function getConversationHistory(): ConversationMessage[] {
  return [...conversationHistory];
}