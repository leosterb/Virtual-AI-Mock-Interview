import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSource } from './load-source.mjs';

const role = { id: 'software-engineer', title: 'Software Engineer', description: 'Build software.', difficulty: 'mid', department: 'Engineering', skills: ['Programming'] };
const feedback = {
  decision: 'maybe', reasoning: 'Needs more evidence.',
  scores: { communication: 1, technical: 6, problemSolving: 7, culturalFit: 5, overall: 5 },
  strengths: ['Clear explanation'], improvements: ['Give examples'],
  answerRatings: [{ answerIndex: 1, score: 6, feedback: 'Add a concrete example.' }],
};

function setup(callProvider) {
  return loadSource('src/lib/claude.ts', { './providers': { callProvider, getProviderSettings: () => ({}) } });
}

test('failed answers can be retried without duplicated conversation turns', async () => {
  let count = 0;
  let sent;
  const agent = setup(async messages => {
    sent = messages;
    if (++count === 1) throw new Error('quota');
    return 'Tell me more.';
  });
  await agent.startInterview(role);
  await assert.rejects(agent.processResponse('My background'), /quota/);
  assert.equal(agent.getConversationHistory().length, 1);
  await agent.processResponse('My background');
  assert.equal(sent.filter(m => m.role === 'user').length, 1);
  assert.equal(agent.getConversationHistory().length, 3);
});

test('evaluation includes the pending final answer and requests JSON separately', async () => {
  let sent;
  const agent = setup(async (messages, budget) => {
    sent = messages;
    assert.equal(budget, 4096);
    return JSON.stringify(feedback);
  });
  await agent.startInterview(role);
  const result = await agent.endInterview('One final example');
  assert.equal(sent.at(-2).content, 'One final example');
  assert.match(sent.at(-1).content, /single JSON object/);
  assert.equal(result.scores.communication, 1);
});

test('malformed feedback, invalid decisions, and scores outside 1–10 are rejected', () => {
  const agent = setup(async () => '');
  for (const text of ['not JSON', JSON.stringify({ ...feedback, decision: 'unknown' }),
    JSON.stringify({ ...feedback, scores: { ...feedback.scores, overall: 11 } }),
    JSON.stringify({ ...feedback, strengths: 'not an array' }),
    JSON.stringify({ ...feedback, scores: {} }),
    JSON.stringify({ ...feedback, scores: { ...feedback.scores, communication: 0 } }),
    JSON.stringify({ ...feedback, answerRatings: [{ answerIndex: 1, score: 1.5, feedback: 'Example' }] }),
    JSON.stringify({ ...feedback, answerRatings: [] })]) {
    assert.throws(() => agent.parseEvaluation(text, 1), /invalid feedback/);
  }
  assert.equal(agent.parseEvaluation('```json\n' + JSON.stringify(feedback) + '\n```').decision, 'maybe');
});

test('canceled responses cannot mutate history, and role prompts contain relevant context', async () => {
  let resolveResponse;
  const agent = setup(() => new Promise(resolve => { resolveResponse = resolve; }));
  const opening = await agent.startInterview(role);
  assert.match(opening, /Software Engineer/);
  const controller = new AbortController();
  const pending = agent.processResponse('Answer', controller.signal);
  controller.abort();
  resolveResponse('Question');
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(agent.getConversationHistory().length, 1);
  const { getSystemPrompt } = loadSource('src/lib/interviewPrompts.ts');
  const prompt = getSystemPrompt(role);
  assert.match(prompt, /Build software/);
  assert.match(prompt, /Ask ONE question at a time/);
  assert.match(prompt, /Do not include evaluation JSON in spoken conversation/);
});
