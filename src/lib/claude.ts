import { Role, Message, InterviewResult } from './types';
import { getSystemPrompt, getOpeningMessage } from './interviewPrompts';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model to use
const MODEL = 'openrouter/free';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

let conversationHistory: ConversationMessage[] = [];
let systemPrompt: string = '';

async function callOpenRouter(messages: ConversationMessage[]): Promise<string> {
  console.log('Calling OpenRouter with messages:', messages.length);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': 'AI Interview Practice',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('OpenRouter error:', error);
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('OpenRouter response:', data);
  return data.choices[0]?.message?.content || '';
}

export async function startInterview(role: Role): Promise<string> {
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
    const assistantContent = await callOpenRouter(messages);
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

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': 'AI Interview Practice',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const evaluationText = data.choices[0]?.message?.content || '';

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