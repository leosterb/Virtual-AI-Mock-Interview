import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadSource } from './load-source.mjs';

const { ResultsCard } = loadSource('src/components/ResultsCard.tsx');
const { CallEndedModal } = loadSource('src/components/CallEndedModal.tsx');
const { StarRating } = loadSource('src/components/StarRating.tsx');
const result = {
  decision: 'maybe', reasoning: 'Use more specific examples.',
  scores: { communication: 6, technical: 7, problemSolving: 5, culturalFit: 8, overall: 6 },
  strengths: ['Clear structure'], improvements: ['Describe the outcome'],
  transcript: [{ role: 'candidate', content: 'I solved a production incident.' }],
  answerRatings: [{ answerIndex: 1, score: 6, feedback: 'Explain what you changed and the result.' }],
};

test('star ratings contain ten stars and an accessible numerical score', () => {
  const html = renderToStaticMarkup(React.createElement(StarRating, { score: 6, label: 'Answer 1' }));
  assert.equal((html.match(/<svg/g) || []).length, 10);
  assert.equal((html.match(/fill-yellow-400/g) || []).length, 6);
  assert.match(html, /Answer 1: 6 out of 10 stars/);
});

test('feedback shows answer-specific ratings, evidence, and constructive advice', () => {
  const html = renderToStaticMarkup(React.createElement(ResultsCard, { result, onPracticeAgain() {} }));
  for (const text of ['Answer 1', 'I solved a production incident.', 'Explain what you changed', 'Practice feedback, not a hiring decision']) assert.ok(html.includes(text));
  assert.equal((html.match(/out of 10 stars/g) || []).length, 6);
});

test('call-ended modal handles loading, success, errors, and no recorded answers', () => {
  const props = { result: null, isGenerating: true, error: null, onRetry() {}, onViewResults() {}, onPracticeAgain() {} };
  const render = patch => renderToStaticMarkup(React.createElement(CallEndedModal, { ...props, ...patch }));
  assert.match(render({}), /Call ended/);
  assert.match(render({}), /preparing feedback/);
  assert.match(render({ isGenerating: false, result }), /Answer 1: 6 out of 10 stars/);
  assert.match(render({ isGenerating: false, error: 'Quota exceeded' }), /Retry feedback/);
  const empty = render({ isGenerating: false });
  assert.match(empty, /No answers were recorded/);
  assert.doesNotMatch(empty, /out of 10 stars/);
});
