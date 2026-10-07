import { Role, InterviewResult } from './types';
import { getSystemPrompt, getOpeningMessage } from './interviewPrompts';
import { callProvider, getProviderSettings } from './providers';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

let conversationHistory: ConversationMessage[] = [];
let systemPrompt = '';
let sessionVersion = 0;

export async function startInterview(role: Role): Promise<string> {
  if (!getProviderSettings()) throw new Error('Choose an AI provider and enter your API key on the home page.');
  sessionVersion += 1;
  systemPrompt = getSystemPrompt(role);
  const opening = getOpeningMessage(role);
  conversationHistory = [{ role: 'assistant', content: opening }];
  return opening;
}

export async function processResponse(userMessage: string, signal?: AbortSignal): Promise<string> {
  const version = sessionVersion;
  const user: ConversationMessage = { role: 'user', content: userMessage };
  const response = await callProvider([
    { role: 'system', content: systemPrompt }, ...conversationHistory, user,
  ], 2048, signal);
  // A failed or canceled request must not duplicate an answer when retried.
  signal?.throwIfAborted();
  if (version !== sessionVersion) throw new Error('This interview has already been replaced by a new session.');
  conversationHistory.push(user, { role: 'assistant', content: response });
  return response;
}

export async function endInterview(finalResponse = '', signal?: AbortSignal): Promise<InterviewResult> {
  const pending: ConversationMessage[] = finalResponse.trim()
    ? [{ role: 'user', content: finalResponse.trim() }] : [];
  const answerCount = conversationHistory.filter(message => message.role === 'user').length + pending.length;
  const evaluationText = await callProvider([
    { role: 'system', content: systemPrompt },
    ...conversationHistory, ...pending,
    { role: 'user', content: `The interview is now complete. Provide the final evaluation as a single JSON object in the specified format. Include answerRatings for all ${answerCount} candidate answers, indexed from 1 in conversation order, with a 1–10 integer score and constructive feedback. Do not include any other text.` },
  ], 4096, signal);
  signal?.throwIfAborted();
  return parseEvaluation(evaluationText, answerCount);
}

export function parseEvaluation(text: string, expectedAnswers?: number): InterviewResult {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error();
    const parsed = JSON.parse(match[0]);
    if (!['hire', 'no-hire', 'maybe'].includes(parsed.decision) || typeof parsed.reasoning !== 'string' || !parsed.reasoning.trim()) throw new Error();
    const keys = ['communication', 'technical', 'problemSolving', 'culturalFit', 'overall'] as const;
    for (const key of keys) {
      const score = parsed.scores?.[key];
      if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 10) throw new Error();
    }
    for (const key of ['strengths', 'improvements']) {
      if (!Array.isArray(parsed[key]) || !parsed[key].every((item: unknown) => typeof item === 'string')) throw new Error();
    }
    if (!Array.isArray(parsed.answerRatings)) throw new Error();
    const ratings = parsed.answerRatings;
    if (expectedAnswers !== undefined && ratings.length !== expectedAnswers) throw new Error();
    ratings.sort((a: { answerIndex: number }, b: { answerIndex: number }) => a.answerIndex - b.answerIndex);
    for (let i = 0; i < ratings.length; i++) {
      const rating = ratings[i];
      if (rating.answerIndex !== i + 1 || !Number.isInteger(rating.score) || rating.score < 1 || rating.score > 10 || typeof rating.feedback !== 'string' || !rating.feedback.trim()) throw new Error();
    }
    return {
      decision: parsed.decision, reasoning: parsed.reasoning, scores: parsed.scores,
      strengths: parsed.strengths, improvements: parsed.improvements, transcript: [], answerRatings: ratings,
    };
  } catch {
    throw new Error('Your provider returned incomplete or invalid feedback. Click End interview to try again.');
  }
}

export function getConversationHistory(): ConversationMessage[] {
  return conversationHistory.map(message => ({ ...message }));
}
